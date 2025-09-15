import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { MobileModal } from "@/components/MobileModal";

const HomePage = () => {
  return (
    <body className="text-cyan-950 text-base not-italic normal-nums font-normal accent-auto bg-white box-border caret-transparent block tracking-[-0.32px] leading-6 list-outside list-disc overflow-x-hidden overflow-y-auto text-start indent-[0px] normal-case visible border-separate font-gt_walsheim md:text-lg md:tracking-[-0.36px] md:leading-[27px]">
      <img
        src="https://c.animaapp.com/mfl9f93tdLmSwy/assets/icon-1.svg"
        alt="Icon"
        className="text-base box-border caret-transparent hidden tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px]"
      />
      <Navbar />
      <Hero />
      <MobileModal />
    </body>
  );
};

export default HomePage;