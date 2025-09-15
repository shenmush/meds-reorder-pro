import { NavbarDropdown } from "@/sections/Navbar/components/NavbarDropdown";

export const DesktopMenu = () => {
  return (
    <ul className="text-base box-border caret-transparent hidden flex-col tracking-[-0.32px] leading-[17.7778px] list-none min-h-0 min-w-0 mx-auto pl-0 md:text-lg md:flex md:flex-row md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto]">
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <a
          href="#"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5"
        >
          Products
        </a>
        <NavbarDropdown />
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <a
          href="/why-pharmacy-x.html"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5"
        >
          Why PharmacyX?
        </a>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <a
          href="/enterprise.html"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5"
        >
          Enterprise
        </a>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <a
          href="/case-studies.html"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5"
        >
          Case Studies
        </a>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <a
          href="/support.html"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5"
        >
          Support
        </a>
      </li>
    </ul>
  );
};