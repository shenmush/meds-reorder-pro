import React from 'react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

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
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;