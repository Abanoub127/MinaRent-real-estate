import React from 'react';
import { useScreenshotGuard } from '../hooks/useScreenshotGuard';
import { Toaster } from './ui/sonner';

export const GlobalGuards: React.FC = () => {
  useScreenshotGuard();
  
  return (
    <Toaster position="top-center" />
  );
};
