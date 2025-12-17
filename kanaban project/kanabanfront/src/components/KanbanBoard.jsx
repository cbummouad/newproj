import { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import api from '../services/api'
import { Plus, X, MoreHorizontal, Trash2, Edit, Check, UserPlus, Users } from 'lucide-react'
import TaskDetailModal from './TaskDetailModal'
import ConfirmationModal from './ConfirmationModal'
import { toast } from 'react-toastify'

// Columns: todo, in-progress, done
const columns = {
    'todo': { title: 'To Do', items: [], color: 'pink' },
    'in-progress': { title: 'In Progress', items: [], color: 'blue' },
    'done': { title: 'Done', items: [], color: 'emerald' }
}

const columnStyles = {
    'pink': {
        borderColor: 'border-t-[3px] border-pink-500 border-x-0 border-b-0',
        bg: 'bg-gradient-to-b from-pink-500/10 to-transparent',
        glow: '',
        title: 'text-pink-900 dark:text-pink-100',
        icon: 'text-pink-600 dark:text-pink-400',
        badge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-200 ring-1 ring-pink-500/30',
        cardBorder: 'border-pink-200 dark:border-pink-500/20',
        cardGlow: 'hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)] hover:border-pink-500/40',
        cardBg: 'bg-gradient-to-br from-white to-pink-50 dark:from-zinc-900 dark:to-pink-900/10',
        btn: 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',
        addBtn: 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/40',
        dragRing: 'ring-pink-500/50'
    },
    'blue': {
        borderColor: 'border-t-[3px] border-blue-500 border-x-0 border-b-0',
        bg: 'bg-gradient-to-b from-blue-500/10 to-transparent',
        glow: '',
        title: 'text-blue-900 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 ring-1 ring-blue-500/30',
        cardBorder: 'border-blue-200 dark:border-blue-500/20',
        cardGlow: 'hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] hover:border-blue-500/40',
        cardBg: 'bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-blue-900/10',
        btn: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
        addBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40',
        dragRing: 'ring-blue-500/50'
    },
    'emerald': {
        borderColor: 'border-t-[3px] border-emerald-500 border-x-0 border-b-0',
        bg: 'bg-gradient-to-b from-emerald-500/10 to-transparent',
        glow: '',
        title: 'text-emerald-900 dark:text-emerald-100',
        icon: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 ring-1 ring-emerald-500/30',
        cardBorder: 'border-emerald-200 dark:border-emerald-500/20',
        cardGlow: 'hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:border-emerald-500/40',
        cardBg: 'bg-gradient-to-br from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-900/10',
        btn: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        addBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/40',
        dragRing: 'ring-emerald-500/50'
    }
}

export default function KanbanBoard({ roomId, lastRefresh, onlineUsers = new Set(), searchQuery = '' }) {
    const [boardData, setBoardData] = useState(columns)
    const [members, setMembers] = useState([])
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [addingTaskStatus, setAddingTaskStatus] = useState(null)
    const [newTaskTitle, setNewTaskTitle] = useState('')

    const [assignMenuTaskId, setAssignMenuTaskId] = useState(null) // ID of task with open assign menu
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [taskToDeleteId, setTaskToDeleteId] = useState(null)

    useEffect(() => {
        fetchTasks()
        fetchMembers()
    }, [roomId, lastRefresh])

    // Close assign menu on outside click logic needed too, can reuse logic later or add separate ref
    const assignMenuRef = useRef(null)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assignMenuRef.current && !assignMenuRef.current.contains(event.target)) {
                setAssignMenuTaskId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const [allTasks, setAllTasks] = useState([])

    useEffect(() => {
        if (allTasks.length > 0) {
            processBoardData(allTasks)
        }
    }, [searchQuery, allTasks])

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/rooms/${roomId}/members`)
            setMembers(res.data)
        } catch (e) {
            console.error("Failed to fetch members", e)
        }
    }

    const fetchTasks = async () => {
        try {
            const res = await api.get(`/tasks/${roomId}`)
            setAllTasks(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const processBoardData = (tasks) => {
        const newBoard = {
            'todo': { title: 'To Do', items: [], color: 'pink' },
            'in-progress': { title: 'In Progress', items: [], color: 'blue' },
            'done': { title: 'Done', items: [], color: 'emerald' }
        }

        const lowerQuery = searchQuery.toLowerCase()

        tasks.forEach(task => {
            // Search Filter
            if (searchQuery) {
                const matchTitle = task.title.toLowerCase().includes(lowerQuery)
                const matchDesc = task.description?.toLowerCase().includes(lowerQuery)
                // Check in task_assignees list
                const matchUser = task.task_assignees?.some(a => a.profiles?.username?.toLowerCase().includes(lowerQuery))
                if (!matchTitle && !matchDesc && !matchUser) return
            }

            if (newBoard[task.status]) {
                newBoard[task.status].items.push(task)
            }
        })

        setBoardData(newBoard)
    }

    const toggleAssignee = async (task, userId) => {
        try {
            const currentAssigneeIds = task.task_assignees?.map(a => a.user_id) || []
            let newAssigneeIds
            if (currentAssigneeIds.includes(userId)) {
                newAssigneeIds = currentAssigneeIds.filter(id => id !== userId)
            } else {
                newAssigneeIds = [...currentAssigneeIds, userId]
            }

            // Optimistic update (optional) - for now just await
            await api.put(`/tasks/${task.id}`, { assignees: newAssigneeIds })
            fetchTasks()
        } catch (e) {
            console.error("Failed to assign task", e)
            toast.error("Failed to update assignees")
        }
    }

    const onDragEnd = async (result) => {
        if (!result.destination) return
        const { source, destination } = result

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = boardData[source.droppableId]
            const destColumn = boardData[destination.droppableId]
            const sourceItems = [...sourceColumn.items]
            const destItems = [...destColumn.items]
            const [removed] = sourceItems.splice(source.index, 1)
            destItems.splice(destination.index, 0, removed)

            setBoardData({
                ...boardData,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems }
            })

            // Update backend via API
            await api.put(`/tasks/${removed.id}`, { status: destination.droppableId, position: destination.index })
        } else {
            // Reordering in same column (optional)
            const column = boardData[source.droppableId]
            const copiedItems = [...column.items]
            const [removed] = copiedItems.splice(source.index, 1)
            copiedItems.splice(destination.index, 0, removed)

            setBoardData({
                ...boardData,
                [source.droppableId]: { ...column, items: copiedItems }
            })
            // Update position backend
            await api.put(`/tasks/${removed.id}`, { position: destination.index })
        }
    }

    const handleAddTaskClick = (status) => {
        setAddingTaskStatus(status)
        setNewTaskTitle('')
    }

    const cancelAddTask = () => {
        setAddingTaskStatus(null)
        setNewTaskTitle('')
    }

    const [activeMenuTaskId, setActiveMenuTaskId] = useState(null)
    const menuRef = useRef(null)

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuTaskId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const deleteTask = (taskId) => {
        setTaskToDeleteId(taskId)
        setIsDeleteModalOpen(true)
    }

    const confirmDeleteTask = async () => {
        if (!taskToDeleteId) return
        try {
            await api.delete(`/tasks/${taskToDeleteId}`)
            fetchTasks()
            toast.success("Task deleted")
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete task")
        } finally {
            setIsDeleteModalOpen(false)
            setTaskToDeleteId(null)
        }
    }

    const submitTask = async (e) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return

        try {
            await api.post('/tasks/', { room_id: roomId, title: newTaskTitle, status: addingTaskStatus })
            fetchTasks()
            toast.success("Task created")
            setNewTaskTitle('')
            // Keep the form open for multiple adds, or close it?
            // Usually nice to keep open for rapid entry, but let's clear title.
            // Or maybe close it. Let's keep it open but clear title.
            // Actually, Trello keeps it open. Let's try that.
        } catch (e) {
            console.error(e)
            toast.error("Failed to create task")
        }
    }

    return (
        <div className="h-full overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full min-w-full overflow-x-auto snap-x snap-mandatory px-4 pb-4">
                    {Object.entries(boardData).map(([columnId, column]) => {
                        const style = columnStyles[column.color || 'blue']
                        return (
                            <div key={columnId} className="w-[85vw] md:w-80 shrink-0 snap-center relative flex flex-col h-full rounded-xl">
                                {/* Glass Background - Separate layer to prevent z-index/fixed trapping */}
                                <div className={`absolute inset-0 rounded-xl border ${style.borderColor} ${style.bg} ${style.glow} backdrop-blur-md transition-colors duration-300`} />

                                <div className="flex flex-col h-full p-4 relative z-10">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-current ${style.icon}`}></div>
                                            <h3 className={`font-bold tracking-tight ${style.title}`}>{column.title}</h3>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${style.badge}`}>{column.items.length}</span>
                                    </div>
                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 space-y-3 transition-colors min-h-[100px] overflow-y-auto pr-1 ${snapshot.isDraggingOver ? 'bg-gray-200/50 dark:bg-gray-700/30' : ''}`}
                                            >
                                                {column.items.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`${style.cardBg} backdrop-blur-sm p-4 rounded-xl shadow-sm border ${style.cardBorder} ${style.cardGlow} group ${snapshot.isDragging ? `rotate-2 shadow-2xl z-50 scale-105 ring-2 ${style.dragRing}` : ''} cursor-grab active:cursor-grabbing transition-colors duration-200`}
                                                                style={{ ...provided.draggableProps.style }}
                                                                onClick={() => setSelectedTaskId(item.id)}
                                                            >
                                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                                    <p className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm leading-snug flex-1 tracking-tight">{item.title}</p>
                                                                    <div className="relative shrink-0">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                setActiveMenuTaskId(activeMenuTaskId === item.id ? null : item.id)
                                                                            }}
                                                                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                                                                        >
                                                                            <MoreHorizontal size={16} />
                                                                        </button>

                                                                        {activeMenuTaskId === item.id && (
                                                                            <div
                                                                                ref={menuRef}
                                                                                className="absolute right-0 top-6 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedTaskId(item.id)
                                                                                        setActiveMenuTaskId(null)
                                                                                    }}
                                                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 flex items-center gap-2 transition-colors"
                                                                                >
                                                                                    <Edit size={14} /> Edit Task
                                                                                </button>
                                                                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                                                                                <button
                                                                                    onClick={() => deleteTask(item.id)}
                                                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                                                                >
                                                                                    <Trash2 size={14} /> Delete
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Tags & Dates Row - Moved Up */}
                                                                {(item.tags?.length > 0 || item.due_date) && (
                                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                        {item.due_date && (
                                                                            <span className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1.5 font-semibold border ${new Date(item.due_date) < new Date() ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' : 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700/50'}`}>
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${new Date(item.due_date) < new Date() ? 'bg-red-500' : 'bg-zinc-400'}`}></span>
                                                                                {new Date(item.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                        {item.tags?.map((tag, i) => (
                                                                            <span key={i} className="text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-transparent" style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}20` }}>
                                                                                {tag.label}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {item.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">{item.description}</p>}

                                                                {/* Subtask Progress Bar */}
                                                                {item.subtasks && item.subtasks.length > 0 && (
                                                                    <div className="mb-3 w-full group/progress">
                                                                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium mb-1.5">
                                                                            <span className="group-hover/progress:text-zinc-600 dark:group-hover/progress:text-zinc-300 transition-colors">Checklist</span>
                                                                            <span className="py-0.5 px-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">{item.subtasks.filter(s => s.is_completed).length}/{item.subtasks.length}</span>
                                                                        </div>
                                                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                                            <div
                                                                                className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                                                                style={{
                                                                                    width: `${Math.round((item.subtasks.filter(s => s.is_completed).length / item.subtasks.length) * 100)}%`,
                                                                                    backgroundColor: column.color === 'emerald' ? '#10b981' : '#8b5cf6'
                                                                                }}
                                                                            >
                                                                                <div className="absolute inset-0 bg-white/20"></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Footer: Assignees */}
                                                                <div className="flex items-center justify-between pt-3 mt-auto relative">
                                                                    <div
                                                                        className="flex items-center group/assignees cursor-pointer relative"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setAssignMenuTaskId(assignMenuTaskId === item.id ? null : item.id)
                                                                        }}
                                                                    >
                                                                        <div className="flex -space-x-2.5 transition-spacing group-hover/assignees:-space-x-1.5 duration-200">
                                                                            {item.task_assignees && item.task_assignees.length > 0 ? (
                                                                                <>
                                                                                    {item.task_assignees.slice(0, 3).map((assignee, idx) => (
                                                                                        <div key={assignee.user_id} className="relative ring-2 ring-white dark:ring-zinc-950 rounded-full z-10 w-7 h-7 transition-transform hover:scale-110 hover:z-20" title={assignee.profiles?.username}>
                                                                                            {assignee.profiles?.avatar_url ? (
                                                                                                <img src={assignee.profiles.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                                                            ) : (
                                                                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 text-violet-700 dark:text-violet-200 flex items-center justify-center text-[10px] font-bold shadow-inner">
                                                                                                    {assignee.profiles?.username?.substring(0, 1).toUpperCase()}
                                                                                                </div>
                                                                                            )}
                                                                                            {onlineUsers.has(assignee.user_id) && (
                                                                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full z-20"></span>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                    {item.task_assignees.length > 3 && (
                                                                                        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 ring-2 ring-white dark:ring-zinc-950 z-10 shadow-sm">
                                                                                            +{item.task_assignees.length - 3}
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <div className="w-7 h-7 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400 group-hover/assignees:border-violet-400 group-hover/assignees:text-violet-500 bg-transparent group-hover/assignees:bg-violet-50 dark:group-hover/assignees:bg-violet-900/20 transition-all">
                                                                                    <UserPlus size={14} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Assignment Dropdown - Positioned relative to footer */}
                                                                    {assignMenuTaskId === item.id && (
                                                                        <div
                                                                            ref={assignMenuRef}
                                                                            className="absolute left-0 bottom-full mb-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">Assign to</div>
                                                                            <div className="max-h-48 overflow-y-auto p-1">
                                                                                {members.map(m => {
                                                                                    const isAssigned = item.task_assignees?.some(a => a.user_id === m.id)
                                                                                    return (
                                                                                        <button
                                                                                            key={m.id}
                                                                                            onClick={() => toggleAssignee(item, m.id)}
                                                                                            className={`w-full text-left px-2 py-1.5 text-xs font-medium rounded-lg flex items-center justify-between gap-2 transition-colors ${isAssigned ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                                                                        >
                                                                                            <div className="flex items-center gap-2">
                                                                                                {m.avatar_url ? (
                                                                                                    <img src={m.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                                                                                                ) : (
                                                                                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold">
                                                                                                        {m.username.substring(0, 1).toUpperCase()}
                                                                                                    </div>
                                                                                                )}
                                                                                                <span>{m.username}</span>
                                                                                            </div>
                                                                                            {isAssigned && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                                                                                        </button>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {addingTaskStatus === columnId ? (
                                                    <form onSubmit={submitTask} className={`bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-lg ring-2 ring-opacity-50 ring-${column.color || 'blue'}-500 animate-in fade-in zoom-in-95 duration-200`}>
                                                        <textarea
                                                            autoFocus
                                                            placeholder="Enter a title for this card..."
                                                            className="w-full text-sm p-1 outline-none resize-none mb-3 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 bg-transparent min-h-[60px]"
                                                            value={newTaskTitle}
                                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault()
                                                                    submitTask(e)
                                                                } else if (e.key === 'Escape') {
                                                                    cancelAddTask()
                                                                }
                                                            }}
                                                            rows={3}
                                                        />
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button type="button" onClick={cancelAddTask} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-xs font-medium">
                                                                Cancel
                                                            </button>
                                                            <button type="submit" className={`text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-lg ${style.addBtn}`}>Add Card</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddTaskClick(columnId)}
                                                        className={`w-full flex items-center justify-center gap-2 ${style.btn} p-2.5 rounded-xl transition-all duration-200 text-sm font-semibold group border border-transparent hover:border-current hover:bg-opacity-10`}
                                                    >
                                                        <Plus size={16} />
                                                        <span>Add Task</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext >

            <TaskDetailModal
                isOpen={!!selectedTaskId}
                taskId={selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
                roomId={roomId}
                onUpdate={fetchTasks}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
                isDanger={true}
            />
        </div >
    )
}
