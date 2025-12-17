import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import { ArrowLeft, User, Mail, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import Loading from '../components/Loading'

export default function Profile() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        username: '',
        avatar_url: '',
        bio: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile')
            setProfile({
                username: res.data.username || '',
                avatar_url: res.data.avatar_url || '',
                bio: res.data.bio || ''
            })
        } catch (e) {
            console.error(e)
            toast.error("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/users/profile', profile)
            toast.success("Profile updated")
        } catch (e) {
            console.error(e)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transition-colors">
                <div className="bg-indigo-600 p-8 text-white relative">
                    <Link to="/" className="absolute top-6 left-6 text-indigo-100 hover:text-white transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex flex-col items-center mt-4">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white/30 flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-lg overflow-hidden mb-4">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile.username?.[0]?.toUpperCase() || <User size={40} />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold">{user.email}</h1>
                        <p className="text-indigo-200 text-sm">Member since {new Date(user.created_at).getFullYear()}</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400"><User size={18} /></span>
                                <input
                                    type="text"
                                    value={profile.username}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. Alex Smith"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                            <input
                                type="text"
                                value={profile.avatar_url}
                                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="https://example.com/my-avatar.jpg"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct link to an image file.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:bg-indigo-400"
                            >
                                {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
