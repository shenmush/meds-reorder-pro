import { FooterContent } from "@/sections/Footer/components/FooterContent";

export const Footer = () => {
  return (
    <footer className="relative text-base bg-cyan-950 box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] z-[3] py-14 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:py-[88px]">
      <div className="absolute text-base box-border caret-transparent h-[278px] tracking-[-0.32px] leading-[17.7778px] top-[-116px] w-full left-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        <div className="absolute text-base box-border caret-transparent hidden h-[278px] tracking-[-0.32px] leading-[17.7778px] overflow-x-hidden overflow-y-auto w-full z-[3] left-0 top-0 md:text-lg md:block md:tracking-[-0.36px] md:leading-[22px]">
          <div className="text-base box-border caret-transparent left-[-23%] tracking-[-0.32px] leading-[17.7778px] z-[3] top-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px]"></div>
        </div>
        <div className="absolute text-base box-border caret-transparent block h-[136px] tracking-[-0.32px] leading-[17.7778px] overflow-x-hidden overflow-y-auto w-full z-[3] left-0 top-0 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px]">
          <div className="text-base box-border caret-transparent left-[-23%] tracking-[-0.32px] leading-[17.7778px] z-[3] top-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px]"></div>
        </div>
      </div>
      <FooterContent />
    </footer>
  );
};