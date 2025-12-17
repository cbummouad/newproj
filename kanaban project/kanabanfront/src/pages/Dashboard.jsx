import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
    const { user, signOut } = useAuth()
    const [rooms, setRooms] = useState([])
    const [invitations, setInvitations] = useState([]) // New state
    const [newRoomName, setNewRoomName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchRooms(), fetchInvitations(), fetchProfile()])
            setLoading(false)
        }
        fetchData()

        // Close menu on click outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile')
            setProfile(res.data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const fetchRooms = async () => {
        try {
            const response = await api.get(`/rooms/${user.id}`)
            setRooms(response.data)
        } catch (error) {
            console.error('Error fetching rooms:', error)
        }
    }

    const fetchInvitations = async () => {
        try {
            const response = await api.get('/rooms/invitations/pending')
            setInvitations(response.data)
        } catch (error) {
            console.error('Error fetching invitations:', error)
        }
    }

    // Filter rooms based on search query
    const filteredRooms = rooms.filter(room => {
        const query = searchQuery.toLowerCase()
        return (
            room.name.toLowerCase().includes(query) ||
            (room.creator_name && room.creator_name.toLowerCase().includes(query))
        )
    })

    const createRoom = async (e) => {
        e.preventDefault()
        if (!newRoomName.trim()) return
        try {
            await api.post('/rooms/', { name: newRoomName, user_id: user.id })
            setNewRoomName('')
            fetchRooms()
        } catch (error) {
            console.error('Error creating room:', error)
        }
    }

    const handleAccept = async (roomId) => {
        try {
            await api.post(`/rooms/invitations/${roomId}/accept`)
            // Refresh both lists
            fetchInvitations()
            fetchRooms()
            toast.success("Invitation accepted")
        } catch (e) {
            console.error("Failed to accept", e)
            toast.error("Failed to accept invitation")
        }
    }

    const handleDecline = async (roomId) => {
        try {
            await api.post(`/rooms/invitations/${roomId}/decline`)
            fetchInvitations()
            toast.info("Invitation declined")
        } catch (e) {
            console.error("Failed to decline", e)
            toast.error("Failed to decline invitation")
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 transition-colors duration-200">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">My Rooms</h1>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold overflow-hidden border border-indigo-200 dark:border-indigo-800">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                                )}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                                {profile?.username || user.email.split('@')[0]}
                            </span>
                            <ChevronDown size={16} className={`text-gray-400 transition ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                                    <p className="text-sm font-bold text-zinc-800 dark:text-white truncate">{profile?.username || 'User'}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-violet-600 dark:hover:text-violet-400 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User size={16} /> My Profile
                                </Link>

                                <button
                                    onClick={signOut}
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-1"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? <Loading /> : (
                <>
                    {/* Actions: Search & Create */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search rooms by name or owner..."
                                className="w-full rounded-lg border-0 bg-white dark:bg-zinc-900 p-3 ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-violet-500 outline-none shadow-sm dark:text-white placeholder-zinc-400 transition-shadow"
                            />
                        </div>
                        <form onSubmit={createRoom} className="flex gap-3 flex-1">
                            <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="New Room Name"
                                className="flex-1 rounded-lg border-0 bg-white dark:bg-zinc-900 p-3 ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-violet-500 outline-none shadow-sm dark:text-white placeholder-zinc-400 transition-shadow"
                            />
                            <button type="submit" className="bg-violet-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-500/20 whitespace-nowrap">Create Room</button>
                        </form>
                    </div>

                    {/* Pending Invitations Section */}
                    {invitations.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
                                <span>Pending Invitations</span>
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{invitations.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {invitations.map(room => (
                                    <div key={room.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
                                        <h3 className="text-xl font-semibold mb-2 dark:text-white">{room.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                            Invited by: <span className="font-medium text-gray-800 dark:text-gray-300">{room.creator_name || 'Unknown'}</span>
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(room.id)}
                                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(room.id)}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-400">
                                No rooms found matching "{searchQuery}"
                            </div>
                        )}
                        {filteredRooms.map(room => (
                            <Link key={room.id} to={`/room/${room.id}`} className="block group">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition duration-300 border border-zinc-200 dark:border-white/5 group-hover:border-violet-300 dark:group-hover:border-violet-500/50">
                                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">{room.name}</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        Created by: {room.created_by === user.id ? <span className="font-bold text-violet-600 dark:text-violet-400">Me</span> : (room.creator_name || 'Unknown')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
