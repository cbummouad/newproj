import { useState, useEffect } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import api from '../services/api'

export default function InviteMemberModal({ roomId, isOpen, onClose }) {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Search Logic
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            if (username.length < 2) {
                setSearchResults([])
                setShowDropdown(false)
                return
            }

            setIsSearching(true)
            try {
                const res = await api.get(`/users/search?q=${username}`)
                setSearchResults(res.data)
                setShowDropdown(true)
            } catch (e) {
                console.error("Search failed", e)
            } finally {
                setIsSearching(false)
            }
        }

        const timeoutId = setTimeout(fetchUsers, 300)
        return () => clearTimeout(timeoutId)
    }, [username])

    const selectUser = (user) => {
        setUsername(user.username)
        setShowDropdown(false)
        setSearchResults([])
    }

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim()) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            await api.post(`/rooms/${roomId}/invite`, { username })
            setSuccess(true)
            setUsername('')
            // Auto close after success? Or just show success msg?
            // Let's keep it open for multiple invites but clear input
        } catch (e) {
            console.error(e)
            setError(e.response?.data?.detail || 'Failed to invite user.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden relative transition-colors">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <UserPlus size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invite Member</h2>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Enter the username of the person you want to invite to this room.
                        <br />
                        <span className="text-xs text-gray-400 dark:text-gray-500">Note: Usernames are case-sensitive (e.g., 'amine').</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        setError(null)
                                        setSuccess(false)
                                    }}
                                    placeholder="Type a name to search..."
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 form-input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white outline-none transition"
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-100 dark:border-gray-600 max-h-60 overflow-y-auto z-10 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                        {isSearching ? (
                                            <div className="p-3 text-center text-xs text-gray-400">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => selectUser(user)}
                                                    className="px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 transition-colors text-sm"
                                                >
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                            {user.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{user.username}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-xs text-gray-400">No matching users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm border border-green-200 dark:border-green-900/30 flex items-center gap-2">
                                <CheckCircle size={16} />
                                User invited successfully!
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !username.trim()}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {loading ? 'Inviting...' : 'Invite'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Missing import fix
import { CheckCircle } from 'lucide-react'
