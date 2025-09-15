import { NavbarDropdown } from "@/sections/Navbar/components/NavbarDropdown";
import { Link } from "react-router-dom";

export const DesktopMenu = () => {
  return (
    <ul className="text-base box-border caret-transparent hidden flex-col tracking-[-0.32px] leading-[17.7778px] list-none min-h-0 min-w-0 mx-auto pl-0 md:text-lg md:flex md:flex-row md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto]">
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <Link
          to="/about"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5 hover:bg-gray-100 transition-colors"
        >
          چرا بارمان؟
        </Link>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <Link
          to="/contact"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5 hover:bg-gray-100 transition-colors"
        >
          پشتیبانی و مشاوره
        </Link>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <Link
          to="/faq"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5 hover:bg-gray-100 transition-colors"
        >
          سوالات متداول
        </Link>
      </li>
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left mx-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:mx-1.5">
        <Link
          to="/blog"
          className="text-base box-border caret-transparent block tracking-[-0.32px] leading-[17.7778px] p-[12.4444px] rounded-[10px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:p-3.5 hover:bg-gray-100 transition-colors"
        >
          وبلاگ
        </Link>
      </li>
    </ul>
  );
};