import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')

    const handleAuth = async (e) => {
        e.preventDefault()
        setError('')
        const cleanEmail = email.trim()
        try {
            if (isSignUp) {
                const { error } = await signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            full_name: cleanEmail.split('@')[0], // Default username
                            avatar_url: `https://ui-avatars.com/api/?name=${cleanEmail}`
                        }
                    }
                })
                if (error) throw error
                toast.success('Check your email for confirmation link!')
            } else {
                const { error } = await signIn({ email: cleanEmail, password })
                if (error) throw error
                navigate('/')
            }
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md transition-colors">
                <h2 className="mb-6 text-center text-2xl font-bold dark:text-white">{isSignUp ? 'Sign Up' : 'Login'}</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-red-600">{error}</div>}
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        {isSignUp ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm dark:text-gray-400">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    )
}
