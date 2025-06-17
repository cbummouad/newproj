import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, LockKeyhole, ArrowRight, Sparkles } from 'lucide-react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

const Description = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 p-8 text-white shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fadeIn">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Join Our Platform
          </h2>
        </div>

        <p className="mb-8 text-lg text-indigo-100 animate-slideUp" style={{ '--delay': '200ms' }}>
          Create an account to unlock all features and join our community of productive professionals.
          Start your journey to better project management today.
        </p>

        <div className="space-y-4">
          {[
            'Personalized dashboard',
            'Team collaboration tools',
            'Advanced analytics',
            'Priority support'
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 animate-slideRight"
              style={{ '--delay': `${(index + 2) * 200}ms` }}
            >
              <ArrowRight className="h-5 w-5 text-indigo-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl animate-blob"></div>
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500 opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
    </div>
  );
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Head title="Register" />

            <div className="flex w-full max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-2xl lg:flex-row animate-fadeIn">
                <div className="flex-1 order-2 lg:order-1">
                    <form onSubmit={submit} className="mx-auto max-w-md space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 animate-slideDown">
                                Create your account
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 animate-slideDown animation-delay-200">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-medium text-indigo-600 transition-colors hover:text-indigo-500">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="group relative animate-slideRight animation-delay-400">
                                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Enter your name"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="group relative animate-slideRight animation-delay-600">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Enter your email"
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="group relative animate-slideRight animation-delay-800">
                                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Create a password"
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="group relative animate-slideRight animation-delay-1000">
                                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className={`relative w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 animate-slideUp animation-delay-1000
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
                                'Create Account'
                            )}
                        </PrimaryButton>
                    </form>
                </div>

                <div className="flex-1 order-1 lg:order-2">
                    <Description />
                </div>
            </div>
        </div>
    );
}
