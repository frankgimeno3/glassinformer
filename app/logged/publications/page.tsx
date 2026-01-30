import Publications from '@/app/(main)/publications/page';
import { FC } from 'react';

interface LoggedPublicationsProps {
  
}

const LoggedPublications: FC<LoggedPublicationsProps> = ({ }) => {
  return (
    <Publications />
  );
};

export default LoggedPublications;