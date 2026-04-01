"use client"
import { FC, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthenticationService from "@/apiClient/AuthenticationService";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_ERROR,
    AUTH_FORM,
    AUTH_ICON_BUTTON,
    AUTH_INPUT,
    AUTH_PAGE_SHELL,
    AUTH_PRIMARY_BUTTON,
    AUTH_SKELETON_CARD,
    AUTH_SKELETON_SHELL,
    AUTH_TITLE,
} from "../_components/authFormStyles";


interface LoginProps {

}

const LoginContent: FC<LoginProps> = ({ }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const redirect = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/logged";

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Middleware handles redirects automatically; no extra check needed here.

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const payload: any = await AuthenticationService.login(email, password);

            // El AuthenticationService ya guarda los tokens en cookies mediante CookieStorage
            // y el username en localStorage
            router.replace(redirect);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Login failed. Please verify your credentials.');
        }
    };

    return (
        <div className={AUTH_PAGE_SHELL}>
            <form
                onSubmit={handleLogin}
                className={`${AUTH_CARD} ${AUTH_FORM}`}
            >
                <h2 className={AUTH_TITLE}>
                    Enter your email and password
                </h2>

                <input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={AUTH_INPUT}
                    required
                />

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${AUTH_INPUT} pr-12`}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={AUTH_ICON_BUTTON}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>

                </div>

                {error && (
                    <div className={AUTH_ERROR}>
                        <p>ERROR:</p>
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className={AUTH_PRIMARY_BUTTON}
                >
                    Log in
                </button>


            <div className='flex flex-col gap-4 pt-2'>
                <p className={AUTH_AUX_TEXT}>
                    Don't have an account?
                    <a href={redirectParam ? `/auth/signup?redirect=${encodeURIComponent(redirectParam)}` : '/auth/signup'} className=' font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1'>
                        Sign up
                    </a>
                </p>
                <div className='flex flex-col gap-4'>
                    <p className={AUTH_AUX_TEXT}>
                        Forgot your password?
                        <a href='/auth/forgot' className=' font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1'>
                            Reset password
                        </a>
                    </p>
                </div>
            </div>
            </form>

        </div>
    );
};

const FallbackForm = () => (
    <div className={AUTH_SKELETON_SHELL}>
        <div className={AUTH_SKELETON_CARD}>
            <div className="h-8 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-12 bg-gray-700 rounded animate-pulse" />
            <div className="h-12 bg-gray-700 rounded animate-pulse" />
        </div>
    </div>
);

export default function LoginPage() {
    return (
        <Suspense fallback={<FallbackForm />}>
            <LoginContent />
        </Suspense>
    );
}