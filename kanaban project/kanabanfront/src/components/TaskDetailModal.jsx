import { useState, useEffect, useRef } from 'react'
import { X, Send, Calendar, User, AlignLeft, MessageSquare, Check, Plus, CheckSquare, Trash2, UserPlus, Sparkles, Loader2, Paperclip, File, Download, ExternalLink } from 'lucide-react'
import api from '../services/api'
import AttachmentUpload from './AttachmentUpload'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

export default function TaskDetailModal({ taskId, isOpen, onClose, roomId, onUpdate }) {
    const { user } = useAuth()
    const [task, setTask] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [description, setDescription] = useState('')
    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [members, setMembers] = useState([])
    const [checklistInput, setChecklistInput] = useState('')
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)

    const [dueDate, setDueDate] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState([])
    const [attachments, setAttachments] = useState([])

    const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false)
    const assignDropdownRef = useRef(null)

    const commentsEndRef = useRef(null)

    useEffect(() => {
        if (isOpen && taskId) {
            fetchTaskDetails()
            fetchComments()
            fetchMembers()
            fetchAttachments()
        }
    }, [isOpen, taskId])

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target)) {
                setIsAssignDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchTaskDetails = async () => {
        try {
            const res = await api.get(`/tasks/details/${taskId}`)
            setTask(res.data)
            setDescription(res.data.description || '')
            setDueDate(res.data.due_date ? res.data.due_date.split('T')[0] : '')
            setTags(res.data.tags || [])
        } catch (e) {
            console.error("Failed to fetch task details", e)
        }
    }

    const fetchAttachments = async () => {
        try {
            const res = await api.get(`/attachments/task/${taskId}`)
            setAttachments(res.data)
        } catch (e) {
            console.error("Failed to fetch attachments", e)
        }
    }

    const deleteAttachment = async (id) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return
        try {
            await api.delete(`/attachments/${id}`)
            fetchAttachments() // Refresh
            toast.success("Attachment deleted")
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete attachment")
        }
    }

    const toggleAssignee = async (userId) => {
        if (!task) return
        try {
            const currentAssigneeIds = task.task_assignees?.map(a => a.user_id) || []
            let newAssigneeIds
            if (currentAssigneeIds.includes(userId)) {
                newAssigneeIds = currentAssigneeIds.filter(id => id !== userId)
            } else {
                newAssigneeIds = [...currentAssigneeIds, userId]
            }

            // Optimistic update local state
            const updatedAssignees = newAssigneeIds.map(uid => {
                const member = members.find(m => m.id === uid)
                return { user_id: uid, profiles: member }
            })

            setTask(prev => ({ ...prev, task_assignees: updatedAssignees }))

            await api.put(`/tasks/${taskId}`, { assignees: newAssigneeIds })
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to update assignees")
        }
    }

    const addSubtask = async (e) => {
        e.preventDefault()
        if (!checklistInput.trim()) return
        try {
            await api.post(`/tasks/${taskId}/subtasks`, { title: checklistInput })
            setChecklistInput('')
            onUpdate() // Refresh parent
            fetchTaskDetails() // Refresh subtasks list
        } catch (e) {
            console.error(e)
            toast.error("Failed to add item")
        }
    }

    const toggleSubtask = async (subtaskId, currentStatus) => {
        if (!task || !task.subtasks) return
        const updatedSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, is_completed: !currentStatus } : s)
        setTask(prev => ({ ...prev, subtasks: updatedSubtasks }))

        try {
            await api.put(`/tasks/subtasks/${subtaskId}`, { is_completed: !currentStatus })
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to update item")
        }
    }

    const deleteSubtask = async (subtaskId) => {
        if (!task || !task.subtasks) return
        const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId)
        setTask(prev => ({ ...prev, subtasks: updatedSubtasks }))
        try {
            await api.delete(`/tasks/subtasks/${subtaskId}`)
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete item")
        }
    }

    const fetchComments = async () => {
        try {
            const res = await api.get(`/tasks/${taskId}/comments`)
            setComments(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/rooms/${roomId}/members`)
            setMembers(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    const handleAIGenerate = async () => {
        setIsGeneratingAI(true)
        try {
            await api.post(`/tasks/${taskId}/ai-subtasks`)
            toast.success("AI generated subtasks!")
            onUpdate()
            fetchTaskDetails()
        } catch (e) {
            console.error(e)
            toast.error("Failed to generate subtasks")
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const handleSendComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            await api.post(`/tasks/${taskId}/comments`, { content: newComment })
            setNewComment('')
            fetchComments()
        } catch (e) {
            console.error(e)
            toast.error("Failed to post comment")
        }
    }

    const saveDescription = async () => {
        try {
            await api.put(`/tasks/${taskId}`, { description: description })
            setIsEditingDesc(false)
            onUpdate()
            toast.success("Description updated")
        } catch (e) {
            console.error(e)
            toast.error("Failed to update description")
        }
    }

    const updateDueDate = async (date) => {
        setDueDate(date)
        try {
            const isoDate = date ? new Date(date).toISOString() : null
            await api.put(`/tasks/${taskId}`, { due_date: isoDate })
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to update date")
        }
    }

    const addTag = async () => {
        if (!tagInput.trim()) return
        const newTag = { label: tagInput, color: 'blue' }
        const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        newTag.color = randomColor

        const updatedTags = [...tags, newTag]
        setTags(updatedTags)
        setTagInput('')

        try {
            await api.put(`/tasks/${taskId}`, { tags: updatedTags })
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to add tag")
        }
    }

    const removeTag = async (index) => {
        const updatedTags = tags.filter((_, i) => i !== index)
        setTags(updatedTags)
        try {
            await api.put(`/tasks/${taskId}`, { tags: updatedTags })
            onUpdate()
        } catch (e) {
            console.error(e)
            toast.error("Failed to remove tag")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
            <div
                className="bg-white/95 dark:bg-zinc-900/95 w-full max-w-5xl h-[95vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden transition-all rounded-t-2xl md:rounded-2xl shadow-2xl border border-white/20 ring-1 ring-black/5 md:animate-in md:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: Task Details */}
                <div className="flex-1 overflow-y-auto bg-transparent relative custom-scrollbar">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-20 flex justify-between items-start p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-white/5">
                        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 leading-tight">{task?.title || 'Loading...'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Meta Row */}
                        <div className="flex flex-wrap gap-6">
                            {/* Assignees */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <User size={14} /> Assignees
                                </label>
                                <div className="relative">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer group"
                                        onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                                    >
                                        <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300">
                                            {task?.task_assignees && task.task_assignees.length > 0 ? (
                                                <>
                                                    {task.task_assignees.map((assignee) => (
                                                        <div key={assignee.user_id} className="relative ring-4 ring-white dark:ring-zinc-900 rounded-full transition-transform hover:scale-110 hover:z-10" title={assignee.profiles?.username}>
                                                            {assignee.profiles?.avatar_url ? (
                                                                <img src={assignee.profiles.avatar_url} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                                                                    {assignee.profiles?.username?.substring(0, 1).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:border-violet-500 hover:text-violet-500 transition-colors z-0">
                                                        <Plus size={16} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm font-medium border border-zinc-200 dark:border-zinc-700 hover:border-violet-500 hover:text-violet-500 transition-colors flex items-center gap-2">
                                                    <UserPlus size={14} />
                                                    <span>Unassigned</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isAssignDropdownOpen && (
                                        <div
                                            ref={assignDropdownRef}
                                            className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                                        >
                                            <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                                Select Members
                                            </div>
                                            <div className="max-h-64 overflow-y-auto px-1 custom-scrollbar">
                                                {members.map(m => {
                                                    const isAssigned = task.task_assignees?.some(a => a.user_id === m.id)
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => toggleAssignee(m.id)}
                                                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between gap-3 transition-colors mb-0.5 ${isAssigned ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-200' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {m.avatar_url ? (
                                                                    <img src={m.avatar_url} className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-zinc-800" />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 ring-2 ring-white dark:ring-zinc-800">
                                                                        {m.username.substring(0, 1).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <span className={isAssigned ? 'font-bold' : ''}>{m.username}</span>
                                                            </div>
                                                            {isAssigned && <Check size={16} className="text-violet-600 dark:text-violet-400" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <Calendar size={14} /> Due Date
                                </label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium outline-none focus:ring-2 focus:ring-violet-500/50 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        value={dueDate}
                                        onChange={(e) => updateDueDate(e.target.value)}
                                    />
                                    <div className="absolute inset-0 rounded-lg bg-violet-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 cursor-default border border-transparent shadow-sm" style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}>
                                        {tag.label}
                                        <button onClick={() => removeTag(i)} className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"><X size={12} /></button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => setTagInput(tagInput ? '' : ' ')} // Just focus logic or styled input
                                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-violet-500 hover:text-violet-500 transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Tag
                                </button>
                            </div>
                            {/* Simple Tag Input (hidden/shown logic can be improved, but reused existing flow for now) */}
                            {tagInput !== '' && (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="text"
                                        placeholder="Tag name..."
                                        className="w-48 bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 px-2 py-1 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-500 transition-colors"
                                        value={tagInput.trim()}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                        autoFocus
                                    />
                                    <button onClick={addTag} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">Save</button>
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <Paperclip size={14} /> Attachments
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {attachments.map(att => (
                                    <div key={att.id} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 aspect-video flex flex-col transition-transform hover:scale-[1.02]">
                                        {/* Preview */}
                                        <div className="flex-1 flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-black/20">
                                            {att.file_type && att.file_type.startsWith('image/') ? (
                                                <img src={att.file_url} className="w-full h-full object-cover" alt={att.file_name} />
                                            ) : (
                                                <div className="text-zinc-400 dark:text-zinc-500">
                                                    <File size={32} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer info using truncated name */}
                                        <div className="bg-white/90 dark:bg-zinc-900/90 p-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 truncate border-t border-zinc-100 dark:border-white/5">
                                            {att.file_name}
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <a
                                                href={att.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                                title="Open/Download"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <button
                                                onClick={() => deleteAttachment(att.id)}
                                                className="p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <AttachmentUpload taskId={taskId} onUploadComplete={fetchAttachments} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <AlignLeft size={14} /> Description
                            </label>

                            {isEditingDesc ? (
                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <textarea
                                        className="w-full min-h-[150px] p-4 text-sm bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-700 dark:text-zinc-200 shadow-inner resize-none leading-relaxed"
                                        placeholder="Add a more detailed description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setIsEditingDesc(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                                        <button onClick={saveDescription} className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-violet-500/30 hover:bg-violet-500 hover:shadow-violet-500/50 transition-all transform hover:-translate-y-0.5">Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        setDescription(task?.description || '')
                                        setIsEditingDesc(true)
                                    }}
                                    className="min-h-[100px] cursor-pointer group rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 p-4 transition-all duration-200"
                                >
                                    <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-7">
                                        {task?.description || <span className="text-zinc-400 dark:text-zinc-500 italic flex items-center gap-2"><Plus size={14} /> Add a description...</span>}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Checklist */}
                        <div className="bg-zinc-50 dark:bg-zinc-950/30 rounded-2xl p-6 border border-zinc-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckSquare size={14} /> Checklist
                                </label>
                                {task?.subtasks?.length > 0 && (
                                    <span className="text-xs font-bold text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700">
                                        {Math.round((task.subtasks.filter(s => s.is_completed).length / task.subtasks.length) * 100)}% Done
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar Component within Checklist */}
                            {task?.subtasks?.length > 0 && (
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-6">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                        style={{ width: `${Math.round((task.subtasks.filter(s => s.is_completed).length / task.subtasks.length) * 100)}%` }}
                                    ></div>
                                </div>
                            )}

                            <div className="space-y-3 mb-4">
                                {task?.subtasks?.map(sub => (
                                    <div key={sub.id} className="group flex items-center gap-3 text-sm transition-all hover:translate-x-1">
                                        <button
                                            onClick={() => toggleSubtask(sub.id, sub.is_completed)}
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${sub.is_completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30 shadow-lg scale-105' : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:border-violet-500 dark:hover:border-violet-500 text-transparent'}`}
                                        >
                                            <Check size={12} strokeWidth={4} />
                                        </button>
                                        <span className={`flex-1 text-zinc-700 dark:text-zinc-200 transition-colors ${sub.is_completed ? 'line-through text-zinc-400 dark:text-zinc-500 decoration-zinc-400' : ''}`}>
                                            {sub.title}
                                        </span>
                                        <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all transform hover:scale-110 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <form onSubmit={addSubtask} className="flex-1 flex gap-2 group focus-within:ring-2 ring-violet-500/20 rounded-xl transition-all">
                                    <input
                                        type="text"
                                        placeholder="Add an item..."
                                        className="flex-1 bg-white dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 outline-none placeholder-zinc-400 transition-transform group-focus-within:translate-x-1"
                                        value={checklistInput}
                                        onChange={(e) => setChecklistInput(e.target.value)}
                                    />
                                    <button type="submit" className="bg-white dark:bg-zinc-800 px-4 rounded-xl text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-zinc-700 transition-colors font-medium text-sm">Add</button>
                                </form>
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={isGeneratingAI}
                                    className="h-[46px] px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed group/ai"
                                    title="Auto-generate subtasks with AI"
                                >
                                    {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover/ai:animate-spin" />}
                                    <span className="hidden xl:inline">AI Magic</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Activity / Comments */}
                <div className="w-full md:w-[400px] bg-zinc-50/80 dark:bg-black/20 flex flex-col border-l border-white/20 dark:border-white/5 h-[400px] md:h-auto shrink-0 backdrop-blur-md">
                    <div className="p-5 border-b border-zinc-200/50 dark:border-white/5">
                        <h3 className="font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <MessageSquare size={16} className="text-violet-500" /> Activity
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {comments.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-400 dark:text-zinc-600">
                                <MessageSquare size={32} className="mb-2 opacity-50" />
                                <p className="text-sm">No comments yet</p>
                            </div>
                        )}
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                                <div className="shrink-0">
                                    {comment.profiles?.avatar_url ? (
                                        <img src={comment.profiles.avatar_url} className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-800" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-bold ring-2 ring-white dark:ring-zinc-800">
                                            {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">{comment.profiles?.username}</span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                                            {new Date(comment.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800/80 p-3 rounded-2xl rounded-tl-none shadow-sm border border-zinc-100 dark:border-white/5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed relative">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>

                    <div className="p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-white/5 backdrop-blur-md">
                        <form onSubmit={handleSendComment} className="flex gap-2 relative">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="flex-1 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 outline-none text-zinc-800 dark:text-zinc-200 shadow-sm transition-all pr-10"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all duration-200 ${newComment.trim() ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:scale-105' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'}`}
                                disabled={!newComment.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
