import React, { FC } from 'react';
import Image from 'next/image';

interface ArticleMiniatureProps {
  contenidoTitulo:string;
  contenidoSubtitulo:string;
  url_imagen:string;
}

const ArticleMiniature: FC<ArticleMiniatureProps> = ({contenidoTitulo, contenidoSubtitulo, url_imagen}) => {


    return (
    <div className='flex flex-col bg-gray-100 hover:bg-gray-200/80 cursor-pointer rounded-lg shadow-xl '>
        <p>{contenidoTitulo}</p>
        <Image src={url_imagen} alt="Image not available"/>
        <p>{contenidoTitulo}</p>

    </div>
  );
};

export default ArticleMiniature;