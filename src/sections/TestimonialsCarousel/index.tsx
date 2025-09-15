export const TestimonialsCarousel = () => {
  return (
    <section className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full mx-auto py-16 px-[24.8889px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:px-[50px]">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-cyan-950 mb-4">What Our Customers Say</h2>
        <p className="text-xl text-gray-600">Real feedback from pharmacy professionals</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
          <p className="text-gray-700 mb-4 italic">
            "PharmacyX has transformed how we operate. The efficiency gains are remarkable."
          </p>
          <div className="font-semibold text-cyan-950">Sarah Johnson</div>
          <div className="text-sm text-gray-600">Community Pharmacist</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
          <p className="text-gray-700 mb-4 italic">
            "Our staff love the system, and I have the happiest team I've ever had working for me."
          </p>
          <div className="font-semibold text-cyan-950">Michael Davis</div>
          <div className="text-sm text-gray-600">Pharmacy Manager</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            ))}
          </div>
          <p className="text-gray-700 mb-4 italic">
            "The patient portal has reduced our workload significantly while improving patient satisfaction."
          </p>
          <div className="font-semibold text-cyan-950">Emma Thompson</div>
          <div className="text-sm text-gray-600">Lead Pharmacist</div>
        </div>
      </div>
    </section>
  );
};