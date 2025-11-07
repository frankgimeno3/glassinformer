import React, { FC } from 'react';

interface LoggedNavProps {
  
}

const LoggedNav: FC<LoggedNavProps> = ({ }) => {
  return (
    <nav className='flex flex-row p-12 bg-blue-950 text-white justify-between'>
        <p>Logo</p>
        <button>Logout</button>
    </nav>
  );
};

export default LoggedNav;