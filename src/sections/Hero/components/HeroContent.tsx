import { AnimatedSection } from "@/components/AnimatedSection";
import { useNavigate } from 'react-router-dom';

export const HeroContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full w-full px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:w-[58.3333%] md:px-[13.5px]">
      <AnimatedSection animation="slideUp" delay={200}>
        <h1 className="text-[44px] font-black box-border caret-transparent tracking-[-0.88px] leading-[44px] uppercase mb-[21.3333px] font-gt_walsheim_condensed_ultra_bold md:text-[64px] md:tracking-[-1.28px] md:leading-[64px] md:mb-6">
          HELPING TO BRING YOUR PHARMACY INTO THE DIGITAL AGE
        </h1>
      </AnimatedSection>
      
      <AnimatedSection animation="slideUp" delay={400}>
        <p className="text-xl box-border caret-transparent tracking-[-0.4px] leading-6 mb-[26.6667px] md:text-2xl md:tracking-[-0.48px] md:leading-[30px] md:mb-[30px]">
          Empower your patients, maximise efficiency -{" "}
          <br className="text-base box-border caret-transparent hidden tracking-[-0.32px] leading-[17.7778px] md:text-lg md:inline-flex md:tracking-[-0.36px] md:leading-[22px]" />
          and find your flow with PharmacyX
        </p>
      </AnimatedSection>
      
      <AnimatedSection animation="scaleIn" delay={600}>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-lg bg-yellow-200 caret-transparent tracking-[-0.36px] leading-[22px] text-center align-middle border border-cyan-950 px-[22.2222px] py-[13.3333px] rounded-[800px] border-solid md:px-[25px] md:py-[15px] md:rounded-[900px] hover:text-black hover:bg-amber-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          ورود
        </button>
      </AnimatedSection>
    </div>
  );
};