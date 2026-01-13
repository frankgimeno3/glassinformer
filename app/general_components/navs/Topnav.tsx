"use client"
import { FC, useState } from 'react';
import BasicButton from '../buttons/BasicButton';
import Link from 'next/link';

interface TopnavProps { }

const Topnav: FC<TopnavProps> = ({ }) => {
    const [isLogged] = useState(true)
    const logout = () => { console.log("logout") }

    return (
        <nav className='flex flex-col shadow-xl  border-b'>
                <header className="flex flex-row bg-white  justify-between border-b border-gray-200 py-8 px-4 w-full px-4 sm:px-6 lg:px-12">
                    <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-2">
                            GlassInformer
                        </h1>
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-sans">
                            {new Date().toLocaleDateString('en-EN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </Link>
                    {
                        isLogged ?
                            <div className='flex flex-row items-center gap-5 text-sm text-gray-500 uppercase tracking-wider font-sans'>
                                <BasicButton textContent='Mediakit' urlRedirection='/directory' />
                                <BasicButton textContent='Login' urlRedirection='/auth/login' />
                                <BasicButton textContent='Sign Up' urlRedirection='/auth/signup' />
                            </div>
                            :
                            <div className='flex flex-row items-center text-sm text-gray-500 uppercase tracking-wider font-sans' onClick={logout}>
                                <BasicButton textContent='Log out' urlRedirection='/' />
                            </div>
                    }
                </header>
        </nav>
    );
};

export default Topnav;