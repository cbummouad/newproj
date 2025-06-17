import { Head, Link, useForm } from '@inertiajs/react';
import { LockKeyhole, Mail, ArrowRight, Sparkles } from 'lucide-react';
import InputError from '@/Components/InputError';

const Description = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fadeIn">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Welcome Back!
          </h2>
        </div>

        <p className="mb-8 text-lg text-blue-100 animate-slideUp" style={{ '--delay': '200ms' }}>
          Our platform offers a seamless experience for managing your tasks and projects efficiently.
          Join us to enhance your productivity and collaborate with your team effortlessly.
        </p>

        <div className="space-y-4">
          {[
            'Real-time collaboration',
            'Smart task management',
            'Intuitive interface',
            'Secure data protection'
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 animate-slideRight"
              style={{ '--delay': `${(index + 2) * 200}ms` }}
            >
              <ArrowRight className="h-5 w-5 text-blue-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl animate-blob"></div>
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
    </div>
  );
};

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Log in" />

            <div className="flex w-full max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-2xl lg:flex-row animate-fadeIn">
                <div className="flex-1 order-2 lg:order-1">
                    <form onSubmit={submit} className="mx-auto max-w-md space-y-6">
                        {status && (
                            <div className="text-sm font-medium text-green-600 animate-slideDown">
                                {status}
                            </div>
                        )}

                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 animate-slideDown">
                                Log in to your account
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 animate-slideDown animation-delay-200">
                                Don't have an account?{' '}
                                <Link href={route('register')} className="font-medium text-blue-600 transition-colors hover:text-blue-500">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="group relative animate-slideRight animation-delay-400">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter your email"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="group relative animate-slideRight animation-delay-600">
                                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter your password"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between animate-slideRight animation-delay-800">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`relative w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 animate-slideUp animation-delay-1000
                                ${processing ? 'cursor-wait opacity-80' : ''}`}
                        >
                            {processing ? (
                                <span className="inline-flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex-1 order-1 lg:order-2">
                    <Description />
                </div>
            </div>
        </div>
    );
}
