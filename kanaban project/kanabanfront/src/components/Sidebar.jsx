import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, User, LogOut, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Sidebar({ isCollapsed, toggleSidebar }) {
    const { user, signOut } = useAuth()
    const location = useLocation()

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            title={isCollapsed ? label : ''}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(to)
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
                } ${isCollapsed ? 'justify-center' : ''}`}
        >
            <Icon size={20} className={isActive(to) ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
            {!isCollapsed && <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-200">{label}</span>}
        </Link>
    )

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/5 flex flex-col z-50 hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                        <MessageSquare className="text-white" size={24} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent whitespace-nowrap">
                                Kanban
                            </h1>
                            <p className="text-xs text-zinc-400 font-medium whitespace-nowrap">Workspace</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                <NavItem to="/" icon={LayoutGrid} label="Dashboard" />
                <NavItem to="/profile" icon={User} label="My Profile" />
            </nav>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full p-1 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors z-50 flex items-center justify-center w-6 h-6 text-zinc-500 dark:text-zinc-400"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-white/5 space-y-4">
                {/* User Info (Mini) */}
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm shrink-0">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                {user?.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={signOut}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${isCollapsed ? 'w-full' : ''}`}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        <LogOut size={16} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    )
}
