import { AnimatedSection } from "@/components/AnimatedSection";

export const IntroSection = () => {
  return (
    <section className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full z-[11] mx-auto pt-[17.7778px] pb-20 px-[24.8889px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:pt-5 md:pb-0 md:px-[50px]">
      <div className="text-base box-border caret-transparent flex flex-wrap justify-center tracking-[-0.32px] leading-[17.7778px] -mx-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:ml-[-13.5px] md:mr-[-13.5px]">
        <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full w-full px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:w-6/12 md:px-[13.5px]">
          <AnimatedSection animation="fadeIn" delay={300}>
            <p className="text-xl box-border caret-transparent tracking-[-0.4px] leading-6 text-center md:text-2xl md:tracking-[-0.48px] md:leading-[30px]">
              بارمان داروخانه ها و تیم هایشون رو آزاد می‌کنه تا روی مراقبت عالی از بیماران تمرکز کنن
              با پردازش های روان‌تر، گردش کار بدون کاغذ و خدمات خودخدمت بیماران.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};