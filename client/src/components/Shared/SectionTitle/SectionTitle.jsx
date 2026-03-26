import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SectionTitle = ({ heading, subheading }) => {
  const container = useRef(null);

  useGSAP(() => {
    /* Guarantee visible first — never leave content invisible */
    gsap.set([".st-heading", ".st-accent", ".st-sub"], { clearProps: "all" });

    ScrollTrigger.create({
      trigger: container.current,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.fromTo(".st-heading",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "expo.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(".st-accent",
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: "left", duration: 0.8, ease: "expo.out", delay: 0.15, clearProps: "transform" }
        );
        gsap.fromTo(".st-sub",
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.6, ease: "expo.out", delay: 0.2, clearProps: "transform,opacity" }
        );
      },
    });
  }, { scope: container });

  return (
    <div ref={container} className="mb-10 md:mb-14">
      <div className="flex items-center gap-5 mb-3 overflow-visible">
        <h2 className="st-heading text-5xl md:text-7xl font-black tracking-tighter title-gradient leading-tight">
          {heading}
        </h2>
        <div className="st-accent hidden md:block h-px flex-1 bg-linear-to-r from-primary to-transparent opacity-20 rounded-full" />
      </div>
      <div className="st-sub flex items-start md:items-center gap-3">
        <div className="mt-1.5 md:mt-0 h-1.5 w-5 rounded-full bg-primary shrink-0" />
        <p className="text-muted-foreground font-semibold text-sm md:text-base max-w-2xl leading-relaxed">
          {subheading}
        </p>
      </div>
    </div>
  );
};

export default SectionTitle;