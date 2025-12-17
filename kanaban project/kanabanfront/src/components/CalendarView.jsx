import { useState, useEffect } from 'react'
import api from '../services/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarView({ roomId, lastRefresh }) {
    const [tasks, setTasks] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        fetchTasks()
    }, [roomId, lastRefresh])

    const fetchTasks = async () => {
        try {
            const res = await api.get(`/tasks/${roomId}`)
            setTasks(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        return { days, firstDay }
    }

    const { days, firstDay } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))

    const getTasksForDate = (day) => {
        return tasks.filter(task => {
            if (!task.due_date) return false
            const taskDate = new Date(task.due_date)
            return taskDate.getDate() === day &&
                taskDate.getMonth() === currentDate.getMonth() &&
                taskDate.getFullYear() === currentDate.getFullYear()
        })
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{monthName} {year}</h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"><ChevronLeft /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"><ChevronRight /></button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] min-h-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-bold text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                        {day}
                    </div>
                ))}

                <div className="col-span-7 grid grid-cols-7 grid-rows-5 h-full">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-b border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/20"></div>
                    ))}

                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1
                        const dayTasks = getTasksForDate(day)
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()

                        return (
                            <div key={day} className={`p-2 border-b border-r border-zinc-100 dark:border-zinc-800/50 min-h-[100px] hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group relative ${isToday ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                <span className={`text-sm font-medium block mb-2 ${isToday ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-zinc-700 dark:text-zinc-400'}`}>{day}</span>
                                <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                    {dayTasks.map(task => (
                                        <div key={task.id} className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1 rounded shadow-sm truncate text-zinc-700 dark:text-zinc-200 border-l-2" style={{ borderLeftColor: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#3b82f6' : '#ec4899' }}>
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
