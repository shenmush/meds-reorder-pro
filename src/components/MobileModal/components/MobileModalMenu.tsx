export const MobileModalMenu = () => {
  return (
    <div className="flex-1 px-5 py-6">
      <nav>
        <ul className="space-y-4">
          <li>
            <a href="#" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              Products
            </a>
          </li>
          <li>
            <a href="#" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              Why PharmacyX?
            </a>
          </li>
          <li>
            <a href="#" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              Enterprise
            </a>
          </li>
          <li>
            <a href="#" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              Case Studies
            </a>
          </li>
          <li>
            <a href="#" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              Support
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};