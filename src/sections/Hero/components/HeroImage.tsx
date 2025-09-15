import { AnimatedSection } from "@/components/AnimatedSection";

export const HeroImage = () => {
  return (
    <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full text-center w-full mt-[44.4444px] px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:w-[41.6667%] md:mt-0 md:px-[13.5px]">
      <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] w-full md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        <AnimatedSection animation="slideLeft" delay={800}>
          <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-[289px] mb-11 left-0 bottom-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-full md:mb-0 hover:scale-105 transition-transform duration-500 mx-auto">
            {/* Pharmacy illustration placeholder */}
            <div className="w-full h-80 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded opacity-90"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-2 bg-cyan-400 rounded mx-auto"></div>
                  <div className="w-20 h-2 bg-cyan-300 rounded mx-auto"></div>
                  <div className="w-12 h-2 bg-cyan-500 rounded mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};