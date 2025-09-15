export const FeaturesCarousel = () => {
  return (
    <section className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-[calc(100%_-_40px)] w-full mx-5 left-0 top-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:mx-auto">
      <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        {/* Feature Cards Carousel - Simplified version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Patient Web App</h3>
            <p className="text-gray-600">Empower patients with self-service capabilities</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Pharmacy System</h3>
            <p className="text-gray-600">Complete pharmacy management solution</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600">Smart insights and reporting</p>
          </div>
        </div>
      </div>
    </section>
  );
};