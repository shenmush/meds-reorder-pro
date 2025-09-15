import { AnimatedSection } from "@/components/AnimatedSection";

export const FeaturesCarousel = () => {
  return <section className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-[calc(100%_-_40px)] w-full mx-5 left-0 top-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:mx-auto">
      <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        {/* Feature Cards Carousel - Simplified version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <AnimatedSection animation="slideUp" delay={100}>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center group-hover:bg-cyan-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-white rounded group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">سفارش گروهی</h3>
              <p className="text-gray-600"> آفرهای بهتر با تجمیع سفارشات</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="slideUp" delay={300}>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center group-hover:bg-cyan-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-white rounded group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">پرداخت منعطف</h3>
              <p className="text-gray-600">شرایط مالی هماهنگ با جریان نقدی داروخانه</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="slideUp" delay={500}>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center group-hover:bg-cyan-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-white rounded group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">صرفه جویی در زمان</h3>
              <p className="text-gray-600">با چندتا کلیک سفارش بده</p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>;
};