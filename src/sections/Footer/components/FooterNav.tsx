export const FooterNav = () => {
  return (
    <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full w-full px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:w-[58.3333%] md:px-[13.5px]">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-white font-semibold mb-4">Products</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Patient Web App
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Pharmacy System
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Analytics
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Why PharmacyX?
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Enterprise
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Case Studies
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Documentation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};