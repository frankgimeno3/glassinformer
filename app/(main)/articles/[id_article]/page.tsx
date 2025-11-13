'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react'; 
const Article = () => {
  const router = useRouter();
  const params = useParams();

  const id_article = params?.id_article as string;

 
  if (!id_article) {
    return <p className="text-red-500">The article you are looking for doesn't exist. </p>;
  }

  return (
    <div className="flex flex-col h-full min-h-screen text-gray-600">
 
      
          {/* no estoy seguro de si quiero meterlos aquí, o hacer esto con RDS y los contents array como dynamo metiendo en 
          vez de idContent id_article como key */}
 
    </div>
  );
};

export default Article;
