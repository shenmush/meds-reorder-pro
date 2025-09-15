import { useNavigate } from 'react-router-dom';

export const DesktopActions = () => {
  const navigate = useNavigate();
  
  return (
    <ul className="text-base box-border caret-transparent hidden flex-col tracking-[-0.32px] leading-[17.7778px] list-none min-h-0 min-w-0 pl-0 md:text-lg md:flex md:flex-row md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto]">
      <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 text-left ml-[5.33333px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:ml-1.5">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-lg bg-yellow-200 caret-transparent tracking-[-0.36px] leading-[22px] text-center align-middle border border-cyan-950 px-[22.2222px] py-[11.5556px] rounded-[800px] border-solid md:px-[25px] md:py-[13px] md:rounded-[900px] hover:text-black hover:bg-amber-100"
        >
          ورود
        </button>
      </li>
    </ul>
  );
};