import { NavbarLogo } from "@/sections/Navbar/components/NavbarLogo";
import { MobileMenuButton } from "@/sections/Navbar/components/MobileMenuButton";
import { DesktopMenu } from "@/sections/Navbar/components/DesktopMenu";
import { DesktopActions } from "@/sections/Navbar/components/DesktopActions";

export const Navbar = () => {
  return (
    <nav className="fixed text-base items-center box-border caret-transparent flex flex-wrap justify-between tracking-[-0.32px] leading-[17.7778px] z-[1030] pt-5 pb-2.5 top-0 inset-x-0 md:text-lg md:flex-nowrap md:justify-start md:tracking-[-0.36px] md:leading-[22px] md:pt-[50px] md:pb-0">
      <div className="text-base items-center bg-white shadow-[rgba(0,0,0,0.15)_0px_8px_16px_0px] box-border caret-transparent flex flex-wrap justify-between tracking-[-0.32px] leading-[17.7778px] max-w-none w-full border border-neutral-100 mx-5 pl-7 pr-2.5 py-[9px] rounded-[88.8889px] border-solid md:text-lg md:shadow-[rgba(0,0,0,0.15)_0px_9px_18px_0px] md:flex-nowrap md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:mx-auto md:pl-[50px] md:pr-6 md:py-6 md:rounded-[100px]">
        <NavbarLogo />
        <MobileMenuButton />
        <DesktopMenu />
        <DesktopActions />
      </div>
    </nav>
  );
};