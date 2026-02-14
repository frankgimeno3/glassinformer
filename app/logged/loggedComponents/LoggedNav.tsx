"use client"
import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BasicButton from '../../general_components/buttons/BasicButton';
import AuthenticationService from '@/app/service/AuthenticationService.js';

interface LoggedNavProps { }

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LoggedNav: FC<LoggedNavProps> = ({ }) => {
    const [isLogged] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const handleLogout = async () => {
        await AuthenticationService.logout();
        router.replace('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            router.push(`/search/${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <nav className='flex flex-col shadow-xl bg-white border-b w-full'>
                <header className="flex flex-row  justify-between border-b border-gray-200 py-8 px-4 w-full px-4 sm:px-6 lg:px-12">
                    <Link href="/logged" className="flex flex-col hover:opacity-80 transition-opacity">
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
                    <div className='flex flex-row items-center gap-5 text-sm text-gray-500 uppercase tracking-wider font-sans'>
                        <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-transparent">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="px-3 py-2 text-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 min-w-[140px] placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="p-2 text-gray-500 bg-transparent border-l border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                <SearchIcon />
                            </button>
                        </form>
                    {
                        isLogged ?
                            <div className='flex flex-row items-center gap-5 text-sm text-gray-500 uppercase tracking-wider font-sans'>
                                <BasicButton textContent='Mediakit' urlRedirection='/logged/mediakit' />
                                <BasicButton textContent='My Companies' urlRedirection='/logged/companies' />
                                <BasicButton textContent='My Profile' urlRedirection='/logged/profile' />
                                <BasicButton textContent='Settings' urlRedirection='/logged/settings' />
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-3 py-1 rounded-lg shadow-lg bg-blue-950 hover:bg-blue-950/90 cursor-pointer text-white"
                                >
                                    Log out
                                </button>
                            </div>
                            :
                            null
                    }
                                        </div>

                </header>
        </nav>
    );
};

export default LoggedNav;