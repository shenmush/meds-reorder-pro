export const ExploreSection = () => {
  return (
    <section className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full mx-auto py-16 px-[24.8889px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:px-[50px]">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-cyan-950">
          Explore Our Solutions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">For Pharmacies</h3>
            <p className="text-gray-700 mb-6">
              Complete pharmacy management system with patient portal integration
            </p>
            <button className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">For Groups</h3>
            <p className="text-gray-700 mb-6">
              Enterprise solutions for pharmacy chains and healthcare groups
            </p>
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};