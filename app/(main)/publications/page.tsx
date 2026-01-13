"use client";
import { FC, useState, useMemo, memo } from 'react';
import Link from 'next/link';
import publicationsData from '@/app/contents/PublicationsContents.json';

interface Publication {
  title: string;
  description: string;
  url: string;
  year: number;
}

interface PublicationsProps {
  
}

const ITEMS_PER_PAGE = 24;

// Componente memoizado para las tarjetas de publicación
const PublicationCard = memo<{ publication: Publication }>(({ publication }) => {
  const isExternal = publication.url.startsWith('http://') || publication.url.startsWith('https://');
  
  const cardContent = (
    <>
      <div className='mx-auto'>
        <div className='bg-black w-80 h-100 rounded-lg object-cover flex items-center justify-center text-white text-sm'>
          {publication.title}
        </div>
      </div>
      <h2 className='text-2xl font-bold'>{publication.title}</h2>
      <p className='text-gray-600'>{publication.description}</p>
    </>
  );

  return (
    <div className='flex flex-col mb-6 sm:mb-8 bg-white/50 hover:bg-white shadow-lg p-6 sm:p-8 rounded-2xl gap-3 mx-12 w-100'>
      {isExternal ? (
        <a 
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          {cardContent}
        </a>
      ) : (
        <Link href={publication.url} className="cursor-pointer">
          {cardContent}
        </Link>
      )}
    </div>
  );
});

PublicationCard.displayName = 'PublicationCard';

const Publications: FC<PublicationsProps> = ({ }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Agrupar y ordenar publicaciones por año (de 2025 hacia atrás)
  const groupedPublications = useMemo(() => {
    const grouped: { [year: number]: Publication[] } = {};
    
    publicationsData.forEach((pub: Publication) => {
      if (!grouped[pub.year]) {
        grouped[pub.year] = [];
      }
      grouped[pub.year].push(pub);
    });

    // Ordenar años de forma descendente (2025 hacia atrás)
    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);

    // Crear array plano con separadores de año
    const flatList: (Publication | { type: 'separator'; year: number })[] = [];
    
    sortedYears.forEach(year => {
      flatList.push({ type: 'separator', year } as any);
      grouped[year].forEach(pub => flatList.push(pub));
    });

    return flatList;
  }, []);

  // Memoizar cálculos de paginación
  const { totalPages, currentPublications } = useMemo(() => {
    const total = Math.ceil(groupedPublications.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const current = groupedPublications.slice(startIndex, endIndex);
    return { totalPages: total, currentPublications: current };
  }, [groupedPublications, currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-8 sm:pb-12'>Publications</h1>
      <div className='flex flex-wrap gap-3 justify-center'>
        {currentPublications.map((item) => {
          if ('type' in item && item.type === 'separator') {
            return (
              <div key={`separator-${item.year}`} className='w-full text-center my-8'>
                <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 border-b-2 border-gray-300 pb-4 inline-block px-8'>
                  {item.year}
                </h2>
              </div>
            );
          }
          
          const publication = item as Publication;
          return (
            <PublicationCard 
              key={publication.title} 
              publication={publication}
            />
          );
        })}
      </div>

      {/* Paginación */}
      <div className='flex justify-center items-center gap-4 mt-8 pb-8'>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Anterior
        </button>
        <span className='text-gray-700 font-medium'>
          {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Publications;