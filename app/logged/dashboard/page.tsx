import React, { FC } from 'react';
import LoggedNav from '../logged_components/LoggedNav';

interface DashboardProps {
  
}

const Dashboard: FC<DashboardProps> = ({ }) => {
  return (
    <div className='flex flex-col'>
      <LoggedNav/>
      <p>Dashboard</p>
    </div>
  );
};

export default Dashboard;