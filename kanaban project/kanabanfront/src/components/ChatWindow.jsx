import { useState, useEffect, useRef } from 'react'
import { Send, Check, CheckCheck, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ChatWindow({ roomId, messages, onSendMessage, onClose }) {
    const { user } = useAuth()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return
        onSendMessage(input)
        setInput('')
    }

    // Helper for Status Ticks
    const StatusIcon = ({ status }) => {
        if (status === 'read') return <CheckCheck size={16} className="text-blue-500" />
        if (status === 'delivered') return <CheckCheck size={16} className="text-gray-400" />
        return <Check size={16} className="text-gray-400" /> // Sent
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/50 relative transition-colors">
            <div className="absolute inset-0 opacity-5 dark:opacity-[0.02] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none"></div>

            <div className="p-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shadow-sm z-10 transition-colors">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3 overflow-hidden text-violet-600 dark:text-violet-400">
                        {/* Placeholder Avatar for Room */}
                        <span className="text-gray-600 dark:text-gray-200 font-bold text-lg">{roomId.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-100 leading-tight">Room Chat</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate w-48 font-mono opacity-80">{roomId}</p>
                    </div>
                </div>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10">
                {messages.map((msg, idx) => {
                    // Normalize username from history (nested) or live (flat)
                    const username = msg.username || msg.profiles?.username || 'Unknown'
                    const isMe = msg.user_id === user.id

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`relative max-w-[80%] rounded-xl px-3 py-2 shadow-sm text-sm border 
                                ${isMe
                                        ? 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-900/50 rounded-tr-none text-zinc-800 dark:text-zinc-100'
                                        : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-tl-none text-zinc-800 dark:text-zinc-100'}
                                `}
                            >
                                {!isMe && (
                                    <div className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1 opacity-90">
                                        {username}
                                    </div>
                                )}

                                <div className={`mr-6 pb-1 text-[15px] leading-relaxed ${isMe ? 'text-gray-800 dark:text-gray-100' : 'text-gray-800 dark:text-gray-100'}`}>
                                    {msg.content}
                                </div>

                                <div className="absolute bottom-1 right-2 flex items-center space-x-1">
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                        {msg.created_at
                                            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Fallback
                                        }
                                    </span>
                                    {isMe && <StatusIcon status={msg.status || 'sent'} />}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/5 flex items-center gap-2 z-10 transition-colors">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border-0 bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 focus:ring-2 focus:ring-violet-500 outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
                />
                <button type="submit" className="p-2.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!input.trim()}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
