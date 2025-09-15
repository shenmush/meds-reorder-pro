import React, { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-1000 ease-out';
    
    if (!isIntersecting) {
      switch (animation) {
        case 'fadeIn':
          return `${baseClass} opacity-0`;
        case 'slideUp':
          return `${baseClass} opacity-0 translate-y-8`;
        case 'slideLeft':
          return `${baseClass} opacity-0 translate-x-8`;
        case 'slideRight':
          return `${baseClass} opacity-0 -translate-x-8`;
        case 'scaleIn':
          return `${baseClass} opacity-0 scale-95`;
        default:
          return `${baseClass} opacity-0`;
      }
    }
    
    return `${baseClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};