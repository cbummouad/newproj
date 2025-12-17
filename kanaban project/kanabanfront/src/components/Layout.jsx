import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
    // Persist state in localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true'
    })

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed)
    }, [isCollapsed])

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex transition-colors duration-200">
            {/* Sidebar (Desktop) */}
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

            {/* Main Content */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {children}
            </main>
        </div>
    )
}
