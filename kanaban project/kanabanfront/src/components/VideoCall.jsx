import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react'
import api from '../services/api'

// Simple ICE Server configuration (uses Google's public STUN)
const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
}

export default function VideoCall({ roomId, userId, onLeave, sendSignal, signalQueue, consumeSignal }) {
    const [localStream, setLocalStream] = useState(null)
    const [peers, setPeers] = useState({}) // { [peerId]: { connection: RTCPeerConnection, stream: MediaStream } }
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [members, setMembers] = useState([])
    const [pinnedId, setPinnedId] = useState(null) // null (grid) or userId (pinned)

    // Refs for mutable state in callbacks and effects
    const localStreamRef = useRef(null)
    const screenStreamRef = useRef(null)
    const peersRef = useRef({})

    // Track processed signal IDs to prevent double processing during React internal re-renders
    const processedSignals = useRef(new Set())

    // Initialize Local Stream
    useEffect(() => {
        const startLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                localStreamRef.current = stream
                setLocalStream(stream)

                // Announce we joined the call
                sendSignal({
                    type: 'signal',
                    target_user_id: 'all',
                    subtype: 'join_call',
                    data: {}
                })
            } catch (err) {
                console.error("Failed to get local stream", err)
                alert("Could not access camera/microphone. Please allow permissions.")
                onLeave()
            }
        }
        startLocalStream()

        return () => {
            // Cleanup
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop())
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop())
            }
            Object.values(peersRef.current).forEach(p => p.connection.close())
        }
    }, [])

    // Fetch details for name mapping
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/rooms/${roomId}/members`)
                setMembers(res.data)
            } catch (e) {
                console.error("Failed to fetch members for call", e)
            }
        }
        fetchMembers()
    }, [roomId])

    const getMemberName = (id) => {
        if (id === userId) return "You"
        const member = members.find(m => m.id === id)
        return member?.username || "Unknown User"
    }

    const togglePin = (id) => {
        setPinnedId(prev => prev === id ? null : id)
    }

    // Handle Incoming Signals Queue
    useEffect(() => {
        if (!signalQueue || signalQueue.length === 0) return

        const processQueue = async () => {
            for (const signal of signalQueue) {
                // Skip if already processed
                if (processedSignals.current.has(signal._id)) continue

                // Mark as processed immediately
                processedSignals.current.add(signal._id)

                // Process the signal
                await handleSignal(signal)

                // Notify parent to remove from queue
                consumeSignal(signal._id)
            }
        }

        processQueue()
    }, [signalQueue])

    const handleSignal = async (signal) => {
        const { sender_user_id, data, subtype } = signal
        if (sender_user_id === userId) return // Ignore self

        if (subtype === 'join_call') {
            // Someone joined, initiate connection (Offer)
            createPeerConnection(sender_user_id, true)
        } else if (subtype === 'leave_call') {
            removePeer(sender_user_id)
        } else if (data) {
            // WebRTC Signaling (Offer/Answer/Candidate)
            let peer = peersRef.current[sender_user_id]

            if (!peer) {
                // New incoming connection (Answerer side)
                if (data.type === 'offer') {
                    peer = createPeerConnection(sender_user_id, false)
                } else {
                    // Received candidate/answer for unknown peer?
                    return
                }
            }

            const pc = peer.connection
            try {
                if (data.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    sendSignal({
                        type: 'signal',
                        target_user_id: sender_user_id,
                        data: answer
                    })
                } else if (data.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data))
                } else if (data.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                }
            } catch (err) {
                console.error("Signal Handling Error", err)
            }
        }
    }

    const createPeerConnection = (peerId, isInitiator) => {
        if (peersRef.current[peerId]) return peersRef.current[peerId] // Already exists

        const pc = new RTCPeerConnection(RTC_CONFIG)

        // Add local tracks (either camera or screen depending on current state)
        const currentStream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : localStreamRef.current
        if (currentStream) {
            currentStream.getTracks().forEach(track => pc.addTrack(track, currentStream))
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({
                    type: 'signal',
                    target_user_id: peerId,
                    data: { candidate: event.candidate }
                })
            }
        }

        pc.ontrack = (event) => {
            // Received remote stream
            const remoteStream = event.streams[0]
            if (remoteStream) {
                setPeers(prev => ({
                    ...prev,
                    [peerId]: { ...prev[peerId], stream: remoteStream }
                }))
            }
        }

        // Store in ref and state
        const peerObj = { connection: pc, stream: null }
        peersRef.current[peerId] = peerObj
        setPeers(prev => ({ ...prev, [peerId]: peerObj }))

        if (isInitiator) {
            // Create Offer
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer)
                sendSignal({
                    type: 'signal',
                    target_user_id: peerId,
                    data: offer
                })
            }).catch(console.error)
        }

        return peerObj
    }

    const removePeer = (peerId) => {
        if (peersRef.current[peerId]) {
            peersRef.current[peerId].connection.close()
            delete peersRef.current[peerId]
            setPeers(prev => {
                const newState = { ...prev }
                delete newState[peerId]
                return newState
            })
        }
    }

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsMuted(!audioTrack.enabled)
            }
        }
    }

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoOff(!videoTrack.enabled)
            }
        }
    }

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // STOP SHARING -> Revert to Camera
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop())
                screenStreamRef.current = null
            }
            setIsScreenSharing(false)
            setLocalStream(localStreamRef.current) // Update preview to camera

            // Replace tracks in all peer connections
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            Object.values(peersRef.current).forEach(({ connection }) => {
                const sender = connection.getSenders().find(s => s.track.kind === 'video')
                if (sender && videoTrack) {
                    sender.replaceTrack(videoTrack)
                }
            })

        } else {
            // START SHARING -> Switch to Screen
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
                screenStreamRef.current = screenStream
                setIsScreenSharing(true)
                setLocalStream(screenStream) // Update preview to screen

                // Handle user clicking "Stop Sharing" on browser UI
                screenStream.getVideoTracks()[0].onended = () => {
                    toggleScreenShare() // Trigger stop logic
                }

                // Replace tracks within existing connections
                const screenTrack = screenStream.getVideoTracks()[0]
                Object.values(peersRef.current).forEach(({ connection }) => {
                    const sender = connection.getSenders().find(s => s.track.kind === 'video')
                    if (sender && screenTrack) {
                        sender.replaceTrack(screenTrack)
                    }
                })

            } catch (err) {
                console.error("Failed to start screen share", err)
            }
        }
    }

    const handleEndCall = () => {
        // Broadcast leave
        sendSignal({
            type: 'signal',
            target_user_id: 'all',
            subtype: 'leave_call',
            data: {}
        })
        onLeave()
    }

    return (
        <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-white font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Live Call
                </h2>
                <div className="text-zinc-400 text-xs">
                    {Object.keys(peers).length + 1} participant{Object.keys(peers).length + 1 !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Video Layout Area */}
            <div className="flex-1 p-4 overflow-hidden flex relative">
                {pinnedId ? (
                    // PINNED LAYOUT
                    <div className="flex w-full h-full gap-4">
                        {/* Main Stage */}
                        <div className="flex-1 bg-zinc-900 rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
                            {(() => {
                                // Render Pinned User
                                if (pinnedId === userId) {
                                    // Local Pinned
                                    return (
                                        <div className="w-full h-full relative group">
                                            <video
                                                ref={v => { if (v) v.srcObject = localStream }}
                                                autoPlay
                                                muted
                                                playsInline
                                                className={`w-full h-full object-contain bg-black transform ${isScreenSharing ? '' : 'scale-x-[-1]'} ${isVideoOff && !isScreenSharing ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                                            />
                                            {!isScreenSharing && isVideoOff && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 -z-10">
                                                    <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl font-bold">You</div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-sm text-white font-medium backdrop-blur-md flex items-center gap-2">
                                                <span>You {isScreenSharing && '(Screen)'}</span>
                                                {isMuted && <MicOff size={14} className="text-red-400" />}
                                            </div>
                                            <button onClick={() => togglePin(userId)} className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Minimize2 size={20} />
                                            </button>
                                        </div>
                                    )
                                } else {
                                    // Remote Pinned
                                    const peer = peers[pinnedId]
                                    if (!peer) return <div className="flex items-center justify-center h-full text-zinc-500">User left</div>
                                    return (
                                        <div className="w-full h-full relative group">
                                            <video
                                                ref={v => { if (v && peer.stream) v.srcObject = peer.stream }}
                                                autoPlay
                                                playsInline
                                                className="w-full h-full object-contain bg-black"
                                            />
                                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-sm text-white font-medium backdrop-blur-md">
                                                {getMemberName(pinnedId)}
                                            </div>
                                            <button onClick={() => togglePin(pinnedId)} className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Minimize2 size={20} />
                                            </button>
                                        </div>
                                    )
                                }
                            })()}
                        </div>

                        {/* Side List */}
                        <div className="w-64 flex flex-col gap-3 overflow-y-auto pr-1">
                            {/* Render everyone ELSE */}
                            {userId !== pinnedId && (
                                <div className="relative bg-zinc-800 rounded-xl overflow-hidden aspect-video shadow-md ring-1 ring-white/10 group shrink-0 cursor-pointer" onClick={() => togglePin(userId)}>
                                    <video
                                        ref={v => { if (v) v.srcObject = localStream }}
                                        autoPlay
                                        muted
                                        playsInline
                                        className={`w-full h-full object-cover transform ${isScreenSharing ? '' : 'scale-x-[-1]'} ${isVideoOff && !isScreenSharing ? 'opacity-0' : 'opacity-100'}`}
                                    />
                                    {!isScreenSharing && isVideoOff && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 -z-10">
                                            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">You</div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm truncate max-w-[80%]">
                                        You
                                    </div>
                                    <div className="absolute inset-0 bg-transparent hover:bg-white/5 transition-colors"></div>
                                </div>
                            )}

                            {Object.entries(peers).map(([peerId, peer]) => {
                                if (peerId === pinnedId) return null
                                return (
                                    <div key={peerId} className="relative bg-zinc-800 rounded-xl overflow-hidden aspect-video shadow-md ring-1 ring-white/10 group shrink-0 cursor-pointer" onClick={() => togglePin(peerId)}>
                                        <video
                                            ref={v => { if (v && peer.stream) v.srcObject = peer.stream }}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm truncate max-w-[80%]">
                                            {getMemberName(peerId)}
                                        </div>
                                        <div className="absolute inset-0 bg-transparent hover:bg-white/5 transition-colors"></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    // GRID LAYOUT (Standard)
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr h-full w-full">
                        {/* Local Video */}
                        <div className="relative bg-zinc-800 rounded-2xl overflow-hidden aspect-video shadow-lg ring-1 ring-white/10 group">
                            <video
                                ref={v => { if (v) v.srcObject = localStream }}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover transform ${isScreenSharing ? '' : 'scale-x-[-1]'} ${isVideoOff && !isScreenSharing ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                            />
                            <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-xs text-white font-medium backdrop-blur-sm flex items-center gap-2">
                                <span>You {isScreenSharing && '(Screen)'}</span>
                                {isMuted && <MicOff size={14} className="text-red-400" />}
                            </div>

                            <button onClick={() => togglePin(userId)} className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20">
                                <Maximize2 size={16} />
                            </button>

                            {/* Avatar fallback */}
                            {!isScreenSharing && (
                                <div className={`absolute inset-0 flex items-center justify-center bg-zinc-800 -z-10`}>
                                    <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold">You</div>
                                </div>
                            )}
                        </div>

                        {/* Remote Videos */}
                        {Object.entries(peers).map(([peerId, peer]) => (
                            <div key={peerId} className="relative bg-zinc-800 rounded-2xl overflow-hidden aspect-video shadow-lg ring-1 ring-white/10 group">
                                <video
                                    ref={v => { if (v && peer.stream) v.srcObject = peer.stream }}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-xs text-white font-medium backdrop-blur-sm">
                                    {getMemberName(peerId)}
                                </div>

                                <button onClick={() => togglePin(peerId)} className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20">
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 flex justify-center items-center gap-4 bg-zinc-900 border-t border-zinc-800">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                    disabled={isScreenSharing}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                >
                    {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                </button>

                <div className="w-px h-8 bg-zinc-800 mx-2"></div>

                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20 px-8"
                    title="End Call"
                >
                    <PhoneOff size={28} />
                </button>
            </div>
        </div>
    )
}
