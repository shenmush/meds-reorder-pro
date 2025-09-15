export const MobileModalNav = () => {
  return (
    <div className="text-base items-center bg-white box-border caret-transparent flex flex-wrap justify-between tracking-[-0.32px] leading-[17.7778px] border-b border-neutral-100 px-5 py-4 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:px-6 md:py-5">
      <div className="flex items-center">
        <span className="text-cyan-950 font-bold text-xl">PharmacyX</span>
      </div>
      <button className="text-gray-600 hover:text-gray-800">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};