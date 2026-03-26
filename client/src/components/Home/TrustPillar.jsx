import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TbCertificate, TbShieldCheck, TbTruckDelivery } from "react-icons/tb";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    icon: TbTruckDelivery, num: "01",
    title: "Climate-Controlled",
    desc: "Specially packaged to ensure your specimen arrives in perfect health, every time.",
    accent: "oklch(0.42 0.12 160)", chipBg: "oklch(0.93 0.05 160)", border: "oklch(0.84 0.08 160)",
  },
  {
    icon: TbCertificate, num: "02",
    title: "Certified Rare",
    desc: "Every rare entry is botanically verified and graded by our expert network.",
    accent: "oklch(0.40 0.10 220)", chipBg: "oklch(0.93 0.04 220)", border: "oklch(0.83 0.07 220)",
  },
  {
    icon: TbShieldCheck, num: "03",
    title: "Secure Exchange",
    desc: "Protected payments and escrow services for high-value botanical trades.",
    accent: "oklch(0.42 0.10 280)", chipBg: "oklch(0.94 0.03 280)", border: "oklch(0.84 0.06 280)",
  },
];

const TrustPillar = () => {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.set(".tp-card", { clearProps: "all" });
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.fromTo(".tp-card",
          { y: 40, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "expo.out", clearProps: "transform,opacity" }
        ),
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="section-spacing">
      <SectionTitle
        heading="Why Luminous Garden"
        subheading="Built for collectors who demand more than just a plant."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PILLARS.map((p, i) => <PillarCard key={i} pillar={p} />)}
      </div>
    </section>
  );
};

const PillarCard = ({ pillar }) => {
  const { icon: Icon, title, desc, accent, chipBg, border, num } = pillar;
  const barRef = useRef(null);

  return (
    <div
      className="tp-card vault-card relative overflow-hidden cursor-default p-8"
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = border;
        if (barRef.current) barRef.current.style.width = "100%";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "";
        if (barRef.current) barRef.current.style.width = "0%";
      }}
    >
      {/* Watermark num */}
      <span className="absolute top-5 right-5 font-black select-none pointer-events-none leading-none"
        style={{ fontFamily: "'Georgia',serif", fontSize: 52, letterSpacing: "-0.04em", color: accent, opacity: 0.05 }}
      >{num}</span>

      {/* Top rule */}
      <div className="absolute top-0 left-7 right-7 rounded-b"
        style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />

      {/* Icon */}
      <div className="flex items-center justify-center mb-6"
        style={{ width: 52, height: 52, borderRadius: 16, background: chipBg, border: `1px solid ${border}` }}
      >
        <Icon size={22} style={{ color: accent }} strokeWidth={1.8} />
      </div>

      <h4 className="text-lg font-black tracking-tight text-foreground mb-2">{title}</h4>
      <p className="text-sm leading-relaxed text-muted-foreground font-medium mb-5">{desc}</p>

      {/* Animated bar */}
      <div className="h-px rounded-full bg-border overflow-hidden">
        <div ref={barRef} className="h-full rounded-full"
          style={{ width: "0%", background: `linear-gradient(90deg, ${accent}, ${accent}77)`, transition: "width 0.85s ease" }}
        />
      </div>
    </div>
  );
};

export default TrustPillar;