import { useRouter } from 'next/navigation';
import React, { FC } from 'react';

interface BasicButtonProps {
  textContent: string;
  urlRedirection: string;
}

const BasicButton: FC<BasicButtonProps> = ({ textContent, urlRedirection }) => {
  const router = useRouter();

  return (
    <button
      className="px-3 py-1 rounded-lg shadow-lg bg-blue-950 hover:bg-blue-950/90 cursor-pointer text-white"
      onClick={() => router.push(urlRedirection)}
    >
      {textContent}
    </button>
  );
};

export default BasicButton;
