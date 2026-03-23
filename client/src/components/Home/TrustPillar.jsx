import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TbCertificate, TbShieldCheck, TbTruckDelivery } from "react-icons/tb";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: TbTruckDelivery,
    title: "Climate-Controlled",
    desc: "Specially packaged to ensure your specimen arrives in perfect health.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: TbCertificate,
    title: "Certified Rare",
    desc: "Every rare entry is DNA-verified and graded by our botanical experts.",
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: TbShieldCheck,
    title: "Secure Exchange",
    desc: "Protected payments and escrow services for high-value botanical trades.",
    color: "from-purple-500 to-pink-600",
    glow: "shadow-purple-500/20",
  },
];

const TrustPillar = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".pillar-card");

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateX: -15,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "back.out(1.2)", 
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => gsap.set(items, { clearProps: "all" }),  
        },
      );
    },
    { scope: container },
  );

  return (
    <section ref={container} className="relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {pillars.map((item, idx) => (
          <div
            key={idx}
            className="pillar-card group relative bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 will-change-transform"
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-[3.5rem] bg-linear-to-br",
                item.color,
              )}
            />

            {/* Icon Forge */}
            <div className="relative mb-8 flex justify-center md:justify-start">
              <div
                className={cn(
                  "absolute inset-0 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-linear-to-br",
                  item.color,
                )}
              />
              <div
                className={cn(
                  "relative size-20 rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500 bg-linear-to-br",
                  item.color,
                  item.glow,
                )}
              >
                <item.icon size={38} strokeWidth={1.5} />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-center md:text-left relative z-10">
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {item.title}
              </h4>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {item.desc}
              </p>
            </div>

            {/* Interactive Progress Line */}
            <div className="absolute bottom-10 left-10 right-10 h-0.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full w-0 group-hover:w-full transition-all duration-1000 ease-out bg-linear-to-r",
                  item.color,
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustPillar;
