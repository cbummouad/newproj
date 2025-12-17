import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import api from '../services/api'
import { UploadCloud, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

export default function AttachmentUpload({ taskId, onUploadComplete }) {
    const [uploading, setUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return
        setUploading(true)

        try {
            for (const file of acceptedFiles) {
                const fileExt = file.name.split('.').pop()
                // Sanitize filename to avoid encoding issues
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const fileName = `${Date.now()}_${safeName}`
                const filePath = `${taskId}/${fileName}`

                // 1. Upload to Supabase Storage
                // Use 'project_files' bucket
                const { error: uploadError } = await supabase.storage
                    .from('project_files')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                // 2. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('project_files')
                    .getPublicUrl(filePath)

                // 3. Save to DB via Backend
                await api.post('/attachments', {
                    task_id: taskId,
                    file_url: publicUrl,
                    file_name: file.name, // Display name
                    file_type: file.type,
                    file_size: file.size
                })
            }
            toast.success("Files uploaded!")
            onUploadComplete()
        } catch (e) {
            console.error("Upload failed", e)
            toast.error("Upload failed: " + (e.message || "Unknown error"))
        } finally {
            setUploading(false)
        }
    }, [taskId, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group
                ${isDragActive
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-[0.99] shadow-inner'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
        >
            <input {...getInputProps()} />
            {uploading ? (
                <div className="flex flex-col items-center gap-2 text-violet-600 dark:text-violet-400">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-sm font-medium animate-pulse">Uploading...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-400 group-hover:text-violet-500 transition-colors">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                        <UploadCloud size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Click or drag files</p>
                        <p className="text-xs text-zinc-400">Images, PDFs, Docs</p>
                    </div>
                </div>
            )}
        </div>
    )
}
