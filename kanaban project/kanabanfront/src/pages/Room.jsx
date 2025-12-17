import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase' // Import Supabase
import KanbanBoard from '../components/KanbanBoard'
import ChatWindow from '../components/ChatWindow'
import InviteMemberModal from '../components/InviteMemberModal'
import { MessageSquare, X, UserPlus, Search, Bell, LogOut, Settings, History } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

import ConfirmationModal from '../components/ConfirmationModal'
import ActivityLogModal from '../components/ActivityLogModal'

import CalendarView from '../components/CalendarView'
import VideoCall from '../components/VideoCall'
import { Calendar as CalendarIcon, Layout, Video, Trash2 } from 'lucide-react'

export default function Room() {
    const { roomId } = useParams()
    const { user } = useAuth() // Need user to compare
    const navigate = useNavigate() // Need to redirect after leave/delete
    const [isChatOpen, setIsChatOpen] = useState(false) // Closed by default
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [roomDetails, setRoomDetails] = useState(null)
    const [isActivityOpen, setIsActivityOpen] = useState(false) // Activity Log State

    // Confirmation Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

    // WebSocket State
    const ws = useRef(null)
    const [chatMessages, setChatMessages] = useState([])
    const [unreadCount, setUnreadCount] = useState(0) // Unread messages count
    const [lastBoardUpdate, setLastBoardUpdate] = useState(null) // Signal for board refresh
    const [onlineUsers, setOnlineUsers] = useState(new Set()) // Track online user IDs
    const [viewMode, setViewMode] = useState('board') // 'board' or 'calendar'

    // Track chat open state for WS
    const isChatOpenRef = useRef(isChatOpen)

    // Call State
    const [inCall, setInCall] = useState(false)
    const [signalQueue, setSignalQueue] = useState([])

    const consumeSignal = (id) => {
        setSignalQueue(prev => prev.filter(s => s._id !== id))
    }

    const [searchQuery, setSearchQuery] = useState('')
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef(null)

    // Notifications State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const notificationRef = useRef(null)
    const [notifications, setNotifications] = useState([])

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        isChatOpenRef.current = isChatOpen
    }, [isChatOpen])

    useEffect(() => {
        // Fetch Room Details
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/rooms/details/${roomId}`)
                setRoomDetails(res.data)
            } catch (e) {
                console.error("Failed to fetch room details", e)
                navigate('/') // Redirect to dashboard if not found
            }
        }
        fetchDetails()

        // Fetch Chat History
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${roomId}`)
                setChatMessages(res.data)
            } catch (e) {
                console.error("Failed to fetch history", e)
            }
        }
        fetchHistory()

        // Connect to WebSocket
        let socket = null;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
                const token = session.access_token
                // Determine WS URL dynamically
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                const wsUrl = baseUrl.replace(/^http/, 'ws') // http->ws, https->wss
                socket = new WebSocket(`${wsUrl}/chat/ws/${roomId}/${user.id}?token=${token}`)
                ws.current = socket

                socket.onopen = () => {
                    console.log('Connected to shared websocket')
                }

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data)

                    // Handle different message types
                    if (data.type === 'board_update') {
                        // Signal board to refresh
                        setLastBoardUpdate(Date.now())
                    } else if (data.type === 'presence_update') {
                        setOnlineUsers(new Set(data.online_users))
                    } else if (data.type === 'signal') {
                        // Queue the signal with a unique ID
                        setSignalQueue(prev => [...prev, { ...data, _id: crypto.randomUUID() }])
                    } else if (data.type === 'notification') {
                        setNotifications((prev) => [data.data, ...prev])
                    } else {
                        // Assume chat message (backward compatibility or default)
                        setChatMessages((prev) => [...prev, data])
                        if (!isChatOpenRef.current) {
                            setUnreadCount((prev) => prev + 1)
                        }
                    }
                }

                socket.onclose = () => {
                    console.log('Shared websocket disconnected')
                }
            }
        })

        return () => {
            socket?.close()
        }
    }, [roomId, user.id])

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Determine API URL same as others or use 'api' instance
                const res = await api.get('/notifications/')
                setNotifications(res.data)
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            }
        }
        // Check if api wrapper has token attached. 'api' service usually has interceptors.
        // If not, we might need manual fetch, but let's assume 'api' works as it is used for rooms/chat.
        fetchNotifications()
    }, [user.id])

    const handleLeaveClick = () => {
        setIsLeaveModalOpen(true)
    }

    const confirmLeave = async () => {
        try {
            await api.post(`/rooms/${roomId}/leave`)
            navigate('/')
            toast.success("Left room successfully")
        } catch (e) {
            console.error(e)
            toast.error(e.response?.data?.detail || "Failed to leave room")
        } finally {
            setIsLeaveModalOpen(false)
        }
    }


    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        try {
            await api.delete(`/rooms/${roomId}`)
            navigate('/')
            toast.success("Room deleted")
        } catch (e) {
            console.error(e)
            toast.error(e.response?.data?.detail || "Failed to delete room")
        } finally {
            setIsDeleteModalOpen(false)
        }
    }


    const sendMessage = (text) => {
        if (!text.trim()) return
        if (ws.current?.readyState === WebSocket.OPEN) {
            // For now, send raw text for chat, or check backend implementation
            // The current backend likely expects raw text or specific JSON
            // We'll send raw text as per previous ChatWindow logic, assuming backend treats it as chat content
            ws.current.send(text)
        }
    }

    const sendSignal = (signalMsg) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(signalMsg))
        }
    }

    const isOwner = roomDetails?.created_by === user.id

    if (!roomDetails) return <Loading />

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-200">
            {inCall && (
                <VideoCall
                    roomId={roomId}
                    userId={user?.id}
                    onLeave={() => setInCall(false)}
                    sendSignal={sendSignal}
                    signalQueue={signalQueue}
                    consumeSignal={consumeSignal}
                />
            )}

            {/* Main Content - Kanban */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Advanced Top Bar */}
                <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-zinc-200 dark:border-white/5 p-4 z-10 grid grid-cols-[auto_1fr_auto] gap-4 items-center transition-colors">

                    {/* Left: Title & Status */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                            <span className="text-white font-bold text-lg">{roomDetails?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tracking-tight truncate flex items-center gap-2">
                                {roomDetails ? roomDetails.name : `Room: ${roomId}`}
                                {isOwner && <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/50">Owner</span>}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className={`w-2 h-2 rounded-full ${onlineUsers.size > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-300'}`}></span>
                                <span>{onlineUsers.size} Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="hidden md:flex justify-center max-w-xl mx-auto w-full">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-inner"
                                placeholder="Search tasks, members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">⌘K</kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Search Trigger (Mock for now, or could expand) */}
                        <button className="md:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                            <Search size={20} />
                        </button>

                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        {/* View Toggle (Board/Calendar) */}
                        <button
                            onClick={() => setViewMode(viewMode === 'board' ? 'calendar' : 'board')}
                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 transition relative group"
                            title={viewMode === 'board' ? 'Switch to Calendar' : 'Switch to Board'}
                        >
                            {viewMode === 'board' ? <CalendarIcon size={20} /> : <Layout size={20} />}
                        </button>

                        {/* Video Call */}
                        <button
                            onClick={() => setInCall(true)}
                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 transition relative group"
                            title="Start Call"
                        >
                            <Video size={20} />
                            {onlineUsers.size > 1 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></span>}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`p-2.5 rounded-xl transition relative ${isNotificationOpen
                                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.is_read) && (
                                    <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-500 rounded-full border border-zinc-100 dark:border-zinc-800"></span>
                                )}
                            </button>

                            {/* Activity Log Toggle */}
                            <button
                                onClick={() => setIsActivityOpen(true)}
                                className="p-2.5 ml-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 transition"
                                title="Activity Log"
                            >
                                <History size={20} />
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</p>
                                        <button
                                            onClick={async () => {
                                                await api.put('/notifications/mark-all-read')
                                                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                                            }}
                                            className="text-xs text-violet-600 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-zinc-400 dark:text-zinc-500 text-sm py-8">
                                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-3 border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer ${!n.is_read ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}
                                                    onClick={async () => {
                                                        if (!n.is_read) {
                                                            await api.put(`/notifications/${n.id}`, { is_read: true })
                                                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item))
                                                        }
                                                        if (n.link) navigate(n.link)
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${n.type === 'system' ? 'text-blue-500' :
                                                            n.type === 'mention' ? 'text-violet-500' : 'text-zinc-500'
                                                            }`}>{n.type}</span>
                                                        <span className="text-[10px] text-zinc-400">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-snug">{n.title}</p>
                                                    {n.content && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{n.content}</p>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

                        {/* User Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                                <div className="w-full h-full rounded-[10px] bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-violet-600 dark:text-violet-400">{user.email[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">My Account</p>
                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => setIsInviteModalOpen(true)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 transition rounded-lg"
                                        >
                                            <UserPlus size={16} /> Invite Member
                                        </button>
                                    </div>

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>

                                    <div className="p-2">
                                        {isOwner ? (
                                            <button onClick={handleDeleteClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                                <Trash2 size={16} /> Delete Room
                                            </button>
                                        ) : (
                                            <button onClick={handleLeaveClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                                <LogOut size={16} /> Leave Room
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                    {viewMode === 'board' ? (
                        <KanbanBoard roomId={roomId} lastRefresh={lastBoardUpdate} onlineUsers={onlineUsers} searchQuery={searchQuery} />
                    ) : (
                        <CalendarView roomId={roomId} lastRefresh={lastBoardUpdate} />
                    )}
                </main>
            </div >

            {/* Sidebar - Chat */}
            {
                isChatOpen && (
                    <>
                        <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setIsChatOpen(false)} />
                        <div className="fixed inset-y-0 right-0 w-full md:w-96 border-l border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 flex flex-col shadow-2xl z-30 animate-in slide-in-from-right duration-300 md:relative md:z-auto">
                            <ChatWindow
                                roomId={roomId}
                                messages={chatMessages}
                                onSendMessage={sendMessage}
                                onClose={() => setIsChatOpen(false)}
                            />
                        </div>
                    </>
                )
            }

            {/* Chat FAB - Always Visible Toggle */}
            {/* On Mobile: Hide when open (use internal close). On Desktop: Show as Close button (Animated to top). */}
            {/* Chat FAB - Open Button Only */}
            <button
                onClick={() => {
                    setIsChatOpen(true)
                    setUnreadCount(0)
                }}
                className={`fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-2xl items-center justify-center transition-all duration-300 hover:scale-110 animate-in zoom-in slide-in-from-bottom-4 group flex bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/30 ${isChatOpen || inCall ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <MessageSquare size={28} className="group-hover:animate-pulse" />

                {!isChatOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-4 border-zinc-50 dark:border-zinc-950 animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Modals */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roomId={roomId}
            />

            <ConfirmationModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={confirmLeave}
                title="Leave Room"
                message="Are you sure you want to leave this room? You will need an invite to join again."
                confirmText="Leave Room"
                isDanger={true}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Room"
                message="Are you sure you want to delete this room? All tasks and chats will be permanently lost."
                confirmText="Delete Room"
                isDanger={true}
            />

            <ActivityLogModal
                roomId={roomId}
                isOpen={isActivityOpen}
                onClose={() => setIsActivityOpen(false)}
            />
        </div >
    )
}
