"use client"
import { useParams } from 'next/navigation';
import React, { FC } from 'react';

interface SearchProps {
  
}

const Search: FC<SearchProps> = ({ }) => {
      const params = useParams();
    
      const Params = params?.search_params as string;
  return (
    <div>
        <p>Params: {Params}</p>
    </div>
  );
};

export default Search;