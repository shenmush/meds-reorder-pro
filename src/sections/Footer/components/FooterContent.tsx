import { FooterLogo } from "@/sections/Footer/components/FooterLogo";
import { FooterNav } from "@/sections/Footer/components/FooterNav";

export const FooterContent = () => {
  return (
    <div className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full mx-auto px-[24.8889px] py-2 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:px-[50px] md:py-6">
      <div className="text-base items-center box-border caret-transparent flex flex-wrap tracking-[-0.32px] leading-[17.7778px] -mx-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:ml-[-13.5px] md:mr-[-13.5px]">
        <FooterLogo />
        <div className="relative text-base box-border caret-transparent block shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full min-h-[auto] min-w-[auto] w-full z-10 px-3 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px] md:min-h-0 md:min-w-0 md:px-[13.5px]">
          <hr className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] opacity-25 my-[26.6667px] border-b-0 border-x-0 border-white/20 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:my-[45px]" />
        </div>
        <FooterNav />
      </div>
      <hr className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] opacity-25 my-[26.6667px] border-b-0 border-x-0 border-white/20 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:my-[45px]" />
      <p className="text-white/50 text-sm box-border caret-transparent tracking-[-0.28px] leading-4 text-center md:text-left">
        <a
          href="/privacy-policy.html"
          className="relative text-gray-500 box-border caret-transparent text-center z-[5] md:text-left"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};