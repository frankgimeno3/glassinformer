"use client"
import { FC, useState } from 'react';
import BasicButton from '../buttons/BasicButton';
import { useRouter } from 'next/navigation';

interface TopnavProps {

}

const Topnav: FC<TopnavProps> = ({ }) => {
    const router = useRouter()
    const [isLogged] = useState(true)
    const logout = () => { console.log("logout") }

    return (
        <nav className='flex flex-col shadow-xl  border-b'>
            <div className='flex flex-row items-center bg-white shadow-lg p-6 justify-between text-gray-600 px-12'>
                <p>Logo</p>
                {
                    isLogged ?
                        <div className='flex flex-row items-center gap-5 text-xs'>
                            <BasicButton textContent='Login' urlRedirection='/public/auth/login' />
                            <BasicButton textContent='Sign Up' urlRedirection='/public/auth/signup' />
                        </div>
                        :
                        <div className='flex flex-row items-center' onClick={logout}>
                            <BasicButton textContent='Login' urlRedirection='/public/auth/login' />
                        </div>
                }
            </div>
            <div className='flex flex-row  text-white bg-white '>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/') }}>Home</button>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/public/directory') }}>Directory</button>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/public/publications') }}>Publications</button>
                <button className='flex-1  bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm'
                    onClick={() => { router.push('/public/mediakit') }}>Mediakit</button>
            </div>
        </nav>
    );
};

export default Topnav;