import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SectionTitle = ({ heading, subheading }) => {
  const container = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      // Animate the main heading first
      tl.from(".main-title", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        // Then the decorative line
        .from(
          ".title-accent",
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.8,
            ease: "expo.out",
          },
          "-=0.4",
        )
        // Finally the subheading (Supporting text)
        .from(
          ".sub-title",
          {
            opacity: 0,
            x: -15,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.4",
        );
    },
    { scope: container },
  );

  return (
    <div ref={container} className="mb-10 md:mb-16 group">
      {/* 1. PRIMARY HEADING (The Hook) */}
      <div className="flex items-center gap-5 overflow-visible mb-3">
        <h2 className="main-title text-5xl md:text-7xl font-black tracking-tighter title-gradient leading-tight">
          {heading}
        </h2>
        {/* Subtle dynamic line to lead the eye */}
        <div className="title-accent hidden md:block h-0.75 flex-1 bg-linear-to-r from-primary to-transparent opacity-20 rounded-full" />
      </div>

      {/* 2. SUBHEADING (The Detail) */}
      <div className="sub-title flex items-start md:items-center gap-4">
        {/* Modern organic indicator */}
        <div className="mt-1 md:mt-0 h-1.5 w-6 rounded-full bg-primary" />
        <p className="text-muted-foreground font-semibold text-sm md:text-base max-w-2xl leading-relaxed">
          {subheading}
        </p>
      </div>

      {/* 3. UNDERLINE (The Border) */}
      <div className="mt-8 h-px w-full bg-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default SectionTitle;
