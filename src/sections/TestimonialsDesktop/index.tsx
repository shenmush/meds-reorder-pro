import frontlineInsight from "@/assets/frontline-insight.jpg";
import ownSystems from "@/assets/own-systems.jpg";
import mission from "@/assets/mission.jpg";

export const TestimonialsDesktop = () => {
  return (
    <section className="text-base box-border caret-transparent hidden tracking-[-0.32px] leading-[17.7778px] max-w-none w-full mx-auto px-[24.8889px] py-2 md:text-lg md:flex md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:px-[50px] md:py-6">
      <div className="text-base items-center box-border caret-transparent flex flex-wrap tracking-[-0.32px] leading-[17.7778px] min-h-0 min-w-0 -mx-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:ml-[-13.5px] md:mr-[-13.5px] md:min-h-[auto] md:min-w-[auto]">
        <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full min-h-0 min-w-0 w-full ml-0 px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:w-[33.3333%] md:ml-[8.33333%] md:px-[13.5px]">
          <img
            src={frontlineInsight}
            alt="Frontline insight"
            className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-full md:text-lg md:tracking-[-0.36px] md:leading-[22px]"
          />
          <img
            src={ownSystems}
            alt="Our own systems"
            className="text-base box-border caret-transparent hidden tracking-[-0.32px] leading-[17.7778px] max-w-full md:text-lg md:tracking-[-0.36px] md:leading-[22px]"
          />
          <img
            src={mission}
            alt="Our mission"
            className="text-base box-border caret-transparent hidden tracking-[-0.32px] leading-[17.7778px] max-w-full md:text-lg md:tracking-[-0.36px] md:leading-[22px]"
          />
        </div>
        <div className="text-base box-border caret-transparent shrink-0 tracking-[-0.32px] leading-[17.7778px] max-w-full min-h-0 min-w-0 w-full ml-0 px-3 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:min-h-[auto] md:min-w-[auto] md:w-6/12 md:ml-[8.33333%] md:px-[13.5px]">
          <ul className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] list-none mb-4 pl-0 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:mb-[18px]">
            <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] text-left mb-[31.1111px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:mb-[35px]">
              <a
                href="#"
                className="text-xl box-border caret-transparent tracking-[-0.4px] leading-6 md:text-2xl md:tracking-[-0.48px] md:leading-[30px]"
              >
                We are the UK's only pharmacy software provider that also
                operates pharmacies, giving us frontline insight into the
                priorities and challenges faced.
              </a>
            </li>
            <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] text-left mb-[31.1111px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:mb-[35px]">
              <a
                href="#"
                className="text-cyan-950/30 text-xl box-border caret-transparent tracking-[-0.4px] leading-6 md:text-2xl md:tracking-[-0.48px] md:leading-[30px] hover:text-cyan-950 hover:border-cyan-950"
              >
                We don't rely on second hand feedback - we're using our own
                systems and products daily, so we know they work.
              </a>
            </li>
            <li className="text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] text-left md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
              <a
                href="#"
                className="text-cyan-950/30 text-xl box-border caret-transparent tracking-[-0.4px] leading-6 md:text-2xl md:tracking-[-0.48px] md:leading-[30px] hover:text-cyan-950 hover:border-cyan-950"
              >
                Our mission is to help community pharmacies defend their
                position as important community hubs, using great technology
                solutions.
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};