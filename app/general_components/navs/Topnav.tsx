"use client"
import { FC, useState } from 'react';
import BasicButton from '../buttons/BasicButton';
import { useRouter } from 'next/navigation';

interface TopnavProps {}

const Topnav: FC<TopnavProps> = ({ }) => {
    const router = useRouter()
    const [isLogged] = useState(true)
    const logout = () => { console.log("logout") }

    return (
        <nav className='flex flex-col shadow-xl  border-b'>
            <div className='flex flex-row items-center bg-white shadow-lg p-6 justify-between text-gray-600 px-12'>
                <p className='text-3xl font-bold'>Glassinformer</p>
                {
                    isLogged ?
                        <div className='flex flex-row items-center gap-5 text-xs'>
                            <BasicButton textContent='Login' urlRedirection='/auth/login' />
                            <BasicButton textContent='Sign Up' urlRedirection='/auth/signup' />
                        </div>
                        :
                        <div className='flex flex-row items-center' onClick={logout}>
                            <BasicButton textContent='Log out' urlRedirection='/' />
                        </div>
                }
            </div>
            <div className='flex flex-row  text-white bg-white '>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/') }}>Home</button>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/publications') }}>Publications</button>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/mediakit') }}>Mediakit</button>
            </div>
        </nav>
    );
};

export default Topnav;