"use client"
import { FC } from 'react';

interface BannerColProps { }

const BannerCol: FC<BannerColProps> = ({ }) => {
    return (
        <div className="hidden md:block w-[20%] flex-shrink-0 pl-6 bg-white">
            {/* Espacio para banners laterales - puedes agregar contenido aquí */}
        </div>
    );
};

export default BannerCol;
 

