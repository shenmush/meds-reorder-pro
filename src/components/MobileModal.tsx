import { MobileModalNav } from "@/components/MobileModal/components/MobileModalNav";
import { MobileModalMenu } from "@/components/MobileModal/components/MobileModalMenu";
import { MobileModalActions } from "@/components/MobileModal/components/MobileModalActions";

export const MobileModal = () => {
  return (
    <div className="fixed text-base box-border caret-transparent hidden h-full tracking-[-0.32px] leading-[17.7778px] overflow-x-hidden overflow-y-auto w-full z-[1055] left-0 top-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
      <div className="relative text-base box-border caret-transparent h-full tracking-[-0.32px] leading-[17.7778px] w-screen md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        <div className="relative text-base bg-clip-padding bg-neutral-100 box-border caret-transparent flex flex-col h-full tracking-[-0.32px] leading-[17.7778px] max-h-[1000px] w-full overflow-auto pb-5 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:pb-[22.5px]">
          <MobileModalNav />
          <MobileModalMenu />
          <MobileModalActions />
        </div>
      </div>
    </div>
  );
};