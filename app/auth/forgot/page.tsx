"use client"
import BasicButton from '@/app/general_components/buttons/BasicButton';
import React, { FC } from 'react';

interface ForgotProps {

}

const Forgot: FC<ForgotProps> = ({ }) => {
    return (
        <div className='flex flex-col bg-white items-center justify-center min-h-screen'>
            <form // onSubmit={handleForgot}
                className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md" >
                <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                    Recuperar contraseña
                </h2>

                <p className="text-sm text-gray-300 text-center mb-2">
                    Introduzca su email y le enviaremos un enlace para restablecer su contraseña.
                </p>

                <input
                    type="email"
                    placeholder="Introduzca su email"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                <button
                    type="submit"
                    className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                    Enviar enlace de confirmación
                </button>

                <p className='text-xs text-white'>
                    ¿Recuerda su contraseña?
                    <a href='/auth/login' className=' font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1'>
                        Iniciar sesión
                    </a>
                </p>
            </form>
            <div className='flex flex-col py-5 text-gray-500 text-center text-sm'>
                <p className='text-xs pb-1'>¿Ya tiene cuenta?</p>
                <BasicButton textContent='Iniciar sesión' urlRedirection='/auth/login'/>
            </div>
        </div>
    );
};

export default Forgot;
