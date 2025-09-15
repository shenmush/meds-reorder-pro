export const MobileModalMenu = () => {
  return (
    <div className="flex-1 px-5 py-6">
      <nav>
        <ul className="space-y-4">
          <li>
            <a href="/why-barman" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              چرا بارمان؟
            </a>
          </li>
          <li>
            <a href="/support" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              پشتیبانی و مشاوره
            </a>
          </li>
          <li>
            <a href="/faq" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              سوالات متداول
            </a>
          </li>
          <li>
            <a href="/blog" className="block text-lg text-gray-800 hover:text-cyan-600 py-2">
              وبلاگ
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};