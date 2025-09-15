import { Link } from "react-router-dom";

export const MobileModalMenu = () => {
  return (
    <div className="flex-1 px-5 py-6">
      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/about" className="block text-lg text-gray-800 hover:text-cyan-600 py-2 transition-colors">
              چرا بارمان؟
            </Link>
          </li>
          <li>
            <Link to="/contact" className="block text-lg text-gray-800 hover:text-cyan-600 py-2 transition-colors">
              پشتیبانی و مشاوره
            </Link>
          </li>
          <li>
            <Link to="/faq" className="block text-lg text-gray-800 hover:text-cyan-600 py-2 transition-colors">
              سوالات متداول
            </Link>
          </li>
          <li>
            <Link to="/blog" className="block text-lg text-gray-800 hover:text-cyan-600 py-2 transition-colors">
              وبلاگ
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};