'use client';

import Mediakit from '@/app/(main)/mediakit/page';
import React, { FC, useState, useRef, useEffect } from 'react';

interface MediakitCopyProps {

}

type InterestOption = 'Communication pack' | 'eMagazine advertisement' | 'Email marketing' | 'Banner' | 'Media partnership' | 'Other';

const MediakitCopy: FC<MediakitCopyProps> = ({ }) => {
  return (
    <Mediakit />
  );
};

export default MediakitCopy;