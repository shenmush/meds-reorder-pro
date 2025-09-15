import { useState } from "react";

export const MobileMenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="text-neutral-100 text-lg bg-neutral-100 caret-transparent block h-[50px] tracking-[-0.36px] leading-[22px] min-h-[auto] min-w-[auto] text-center align-middle w-[50px] p-0 rounded-[50%] md:hidden md:min-h-0 md:min-w-0 hover:text-black hover:border-black transform hover:scale-110 transition-all duration-300"
    >
      <div className="relative w-6 h-6 mx-auto">
        <span className={`absolute block w-6 h-0.5 bg-cyan-950 transition-all duration-300 ${isOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
        <span className={`absolute block w-6 h-0.5 bg-cyan-950 transition-all duration-300 top-3 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
        <span className={`absolute block w-6 h-0.5 bg-cyan-950 transition-all duration-300 ${isOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
      </div>
    </button>
  );
};