import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-2 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {message}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all transform active:scale-95 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
