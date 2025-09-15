import { HeroContent } from "@/sections/Hero/components/HeroContent";
import { HeroImage } from "@/sections/Hero/components/HeroImage";
import { FloatingElements } from "@/components/FloatingElements";
import { ParallaxBackground } from "@/components/ParallaxBackground";

export const Hero = () => {
  return (
    <header className="relative text-base bg-neutral-100 box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] z-10 py-[150px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:pt-[260px] md:pb-[273px] overflow-hidden">
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Animated wave background */}
      <div className="absolute inset-0 z-[1]">
        <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none">
          <path
            d="M0,300 Q300,100 600,300 T1200,300 V600 H0 Z"
            fill="rgba(165, 255, 235, 0.1)"
            className="animate-pulse"
          />
        </svg>
      </div>
      
      <img
        src="https://c.animaapp.com/mfl9f93tdLmSwy/assets/icon-2.svg"
        alt="Icon"
        className="absolute text-base box-border caret-transparent hidden h-[215px] tracking-[-0.32px] leading-[17.7778px] w-full z-[1] left-0 top-0 md:text-lg md:block md:tracking-[-0.36px] md:leading-[22px] animate-pulse"
      />
      <img
        src="https://c.animaapp.com/mfl9f93tdLmSwy/assets/icon-3.svg"
        alt="Icon"
        className="absolute text-base box-border caret-transparent block h-[127px] tracking-[-0.32px] leading-[17.7778px] w-full z-[1] left-0 top-0 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px] animate-pulse"
      />
      <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full z-10 mx-auto pb-2 px-[24.8889px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:pb-6 md:px-[50px]">
        <div className="text-base items-center box-border caret-transparent flex flex-wrap tracking-[-0.32px] leading-[17.7778px] -mx-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:ml-[-13.5px] md:mr-[-13.5px]">
          <HeroContent />
          <HeroImage />
        </div>
      </div>
    </header>
  );
};