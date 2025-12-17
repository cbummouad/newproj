import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm font-medium">Loading...</p>
        </div>
    )
}
