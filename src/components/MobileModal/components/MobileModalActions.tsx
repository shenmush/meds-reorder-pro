import { useNavigate } from 'react-router-dom';

export const MobileModalActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="px-5 py-6 border-t border-gray-200">
      <button
        onClick={() => navigate('/login')}
        className="w-full text-lg bg-yellow-200 text-center border border-cyan-950 px-6 py-3 rounded-full hover:bg-amber-100 transition-colors"
      >
        ورود
      </button>
    </div>
  );
};