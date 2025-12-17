import { useState, useEffect } from 'react'
import api from '../services/api'
import { History, UserPlus, FileEdit, Trash2, MessageSquare, CheckCircle, ArrowRight, Loader2, X } from 'lucide-react'

export default function ActivityLogModal({ roomId, isOpen, onClose }) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/rooms/${roomId}/activity`)
            setLogs(res.data)
        } catch (e) {
            console.error("Failed to fetch activity logs", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            fetchLogs()
            // Simple polling for live updates while open
            const interval = setInterval(fetchLogs, 5000)
            return () => clearInterval(interval)
        }
    }, [roomId, isOpen])

    if (!isOpen) return null

    const getIcon = (type) => {
        switch (type) {
            case 'create_task': return <FileEdit size={16} className="text-green-500" />
            case 'move_task': return <ArrowRight size={16} className="text-blue-500" />
            case 'delete_task': return <Trash2 size={16} className="text-red-500" />
            case 'comment': return <MessageSquare size={16} className="text-yellow-500" />
            case 'join_room': return <UserPlus size={16} className="text-purple-500" />
            case 'leave_room': return <Trash2 size={16} className="text-gray-500" />
            case 'complete_task':
            case 'complete_subtask':
                return <CheckCircle size={16} className="text-green-600" />
            default: return <History size={16} className="text-gray-400" />
        }
    }

    const formatMessage = (log) => {
        const { action_type, entity_title, details, user } = log
        const name = user?.username || 'Unknown'
        const title = entity_title || 'item'

        switch (action_type) {
            case 'create_task':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> created task "{title}"</span>
            case 'move_task':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> moved "{title}" to <b>{details?.status}</b></span>
            case 'delete_task':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> deleted task "{title}"</span>
            case 'comment':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> commented on "{title}"</span>
            case 'join_room':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> joined the room</span>
            case 'leave_room':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> left the room</span>
            case 'complete_subtask':
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> completed subtask "{details?.subtask}" in "{title}"</span>
            default:
                return <span><b className="text-zinc-900 dark:text-white">{name}</b> performed {action_type}</span>
        }
    }

    const formatTime = (isoString) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            {/* Slide-over Drawer style */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="text-violet-600" />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Activity Log</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading && logs.length === 0 ? (
                        <div className="flex justify-center py-10 text-zinc-400"><Loader2 className="animate-spin" /></div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500">No recent activity</div>
                    ) : (
                        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-6">
                                    {/* Dot */}
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Icon Box */}
                                        <div className="mt-0.5 relative shrink-0">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                {getIcon(log.action_type)}
                                            </div>
                                            {log.user?.avatar_url && (
                                                <img src={log.user.avatar_url} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-zinc-900" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {formatMessage(log)}
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-1">{formatTime(log.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
