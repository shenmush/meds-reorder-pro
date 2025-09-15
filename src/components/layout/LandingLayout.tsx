import React from 'react';
import LandingHeader from './LandingHeader';
import { Footer } from '@/sections/Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <LandingHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;