'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateSignInForm } from '@/lib/utils';

const SignInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackError = searchParams.get('error');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLocalError(null);

        const errors = validateSignInForm(email, password);

        if (Object.keys(errors).length > 0) {
            setEmailError(errors.email ?? null);
            setPasswordError(errors.password ?? null);
            setIsLoading(false);
            return;
        }

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        setIsLoading(false);

        if (!result?.ok) {
            const errorMessage = " Incorrect credentials";
            setLocalError(errorMessage);
        } else {
            router.push("/")
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
                <h1 className='text-3xl font-semibold text-center mb-6'>Sign In</h1>
                {(localError || callbackError === 'CredentialsSignin') && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline">{localError || 'Invalid credentials'}</span>
                    </div>
                )}
                <form onSubmit={handleSignIn}>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>Email Address:</label>
                        <input
                            type='email'
                            id='email'
                            value={email}
                            className='shadow appearance-none border rouded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>Password:</label>
                        <input
                            type='password'
                            id='password'
                            value={password}
                            className='shadow appearance-none border rouded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='flex items-center justify-between'>
                        <button
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            type='submit'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                        <a href='/register' className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800'>Create an Account</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignInPage;