"use client"
import BasicButton from '@/app/general_components/buttons/BasicButton';
import React, { FC } from 'react';

interface SignupProps {

}

const Signup: FC<SignupProps> = ({ }) => {
    return (
        <div className='flex flex-col bg-white items-center justify-center min-h-screen'>
            <form // onSubmit={handleSignup}
                className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md" >
                <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                    Create an account
                </h2>

                <input
                    type="text"
                    placeholder="Enter your name"
                    // value={name}
                    // onChange={(e) => setName(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                <input
                    type="email"
                    placeholder="Enter your email"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                <div className="relative">
                    <input
                        type="password"
                        placeholder="Enter your password"
                        // value={password}
                        // onChange={(e) => setPassword(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full pr-10"
                        required
                    />
                </div>

                <div className="relative">
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        // value={confirmPassword}
                        // onChange={(e) => setConfirmPassword(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full pr-10"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                    Sign up
                </button>

                <p className='text-xs text-white'>
                    Already have an account?
                    <a href='/auth/login' className=' font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1'>
                        Log in
                    </a>
                </p>
            </form>
           
        </div>
    );
};

export default Signup;
