import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TbUserPlus, TbSearch, TbShoppingCart, TbMapPin } from "react-icons/tb";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01", icon: TbUserPlus, verb: "Initialize", tag: "Identity",
    title: "Create Your Account",
    desc: "Sign up as a Collector or Professional Grower. Verification takes 60 seconds.",
    accent: "oklch(0.42 0.14 160)", tint: "oklch(0.94 0.04 160)",
  },
  {
    num: "02", icon: TbSearch, verb: "Discover", tag: "Catalogue",
    title: "Browse Specimens",
    desc: "Explore verified botanical listings with high-resolution imagery, full provenance, and live stock counts.",
    accent: "oklch(0.38 0.10 220)", tint: "oklch(0.94 0.03 220)",
  },
  {
    num: "03", icon: TbShoppingCart, verb: "Acquire", tag: "Transaction",
    title: "Place Your Order",
    desc: "Choose quantity and delivery address. Stock is reserved atomically — no double orders, ever.",
    accent: "oklch(0.44 0.12 280)", tint: "oklch(0.95 0.03 280)",
  },
  {
    num: "04", icon: TbMapPin, verb: "Track", tag: "Logistics",
    title: "Receive & Enjoy",
    desc: "Real-time order tracking from seller confirmation to your doorstep. Every step logged.",
    accent: "oklch(0.44 0.12 55)", tint: "oklch(0.95 0.04 55)",
  },
];

const FEATURES = [
  { emoji: "⚡", label: "60-second signup", sub: "No lengthy verification process" },
  { emoji: "🔒", label: "Atomic stock locking", sub: "Zero overselling, ever" },
  { emoji: "📦", label: "Real-time tracking", sub: "Every status change logged" },
  { emoji: "🌱", label: "Verified growers", sub: "ID-checked nursery partners" },
  { emoji: "💳", label: "Secure payments", sub: "COD · bKash · Stripe ready" },
];

const BotanicalProtocol = () => {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.set([".bp-entry", ".bp-rule", ".bp-panel"], { clearProps: "all" });

    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.fromTo(".bp-rule",
          { scaleY: 0 },
          { scaleY: 1, transformOrigin: "top", duration: 1.1, ease: "expo.out" }
        );
        gsap.fromTo(".bp-entry",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "expo.out", clearProps: "transform,opacity" }
        );
        gsap.fromTo(".bp-panel",
          { x: 28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.18, clearProps: "transform,opacity" }
        );
      },
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="section-spacing">
      <SectionTitle
        heading="The Botanical Protocol"
        subheading="Four precise steps from discovery to delivery."
      />

      {/* 2-col on ≥900px, stacked on mobile */}
      <div className="bp-layout">

        {/* LEFT: step list */}
        <div className="relative">
          {/* Vertical rule — pure CSS, no window.innerWidth */}
          <div
            className="bp-rule absolute top-0 bottom-0 rounded-full"
            style={{ left: 0, width: 1, background: "linear-gradient(to bottom, var(--primary), oklch(0.65 0.14 160 / 0.10))" }}
          />
          <div className="flex flex-col gap-0 pl-8 sm:pl-10">
            {STEPS.map((step, idx) => (
              <StepEntry key={idx} step={step} isLast={idx === STEPS.length - 1} />
            ))}
          </div>
        </div>

        {/* RIGHT: feature panel */}
        <div className="bp-panel">
          <FeaturePanel />
        </div>
      </div>

      <style>{`
        .bp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (min-width: 900px) {
          .bp-layout { grid-template-columns: 1fr 360px; gap: 64px; }
        }
        @media (min-width: 1100px) {
          .bp-layout { grid-template-columns: 1fr 400px; }
        }
      `}</style>
    </section>
  );
};

const StepEntry = ({ step, isLast }) => {
  const { num, icon: Icon, verb, title, desc, tag, accent, tint } = step;

  return (
    <div className={`bp-entry relative ${isLast ? "pb-0" : "pb-7"}`}>
      {/* Dot on rule */}
      <div
        className="absolute -left-8 sm:-left-10 top-5 rounded-full border-2 border-background z-10"
        style={{ width: 13, height: 13, background: accent, boxShadow: `0 0 0 3px ${accent}30` }}
      />
      {/* Connector segment */}
      {!isLast && (
        <div
          className="absolute top-8 bg-border"
          style={{ left: "-calc(2rem - 7px)", width: 1, height: "calc(100% - 32px)", }}
        />
      )}

      <div
        className="vault-card overflow-hidden transition-all duration-200 hover:translate-x-1"
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}55`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = ""; }}
      >
        {/* Color stripe */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, ${accent}33)` }} />

        <div className="flex items-stretch">
          {/* Number column */}
          <div
            className="flex flex-col items-center justify-center gap-2 border-r border-border shrink-0 py-4"
            style={{ width: 56, background: tint }}
          >
            <span
              className="font-black leading-none"
              style={{ fontFamily: "'Georgia',serif", fontSize: 20, letterSpacing: "-0.04em", color: accent }}
            >{num}</span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 24, height: 24, background: "var(--card)", border: `1px solid ${accent}33` }}
            >
              <Icon size={12} style={{ color: accent }} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] italic"
                style={{ fontFamily: "'Georgia',serif", color: accent }}
              >{verb}</span>
              <span className="text-[8px] font-800 uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                style={{ background: tint, color: accent, border: `1px solid ${accent}33` }}
              >{tag}</span>
            </div>
            <h4 className="text-sm sm:text-base font-black tracking-tight text-foreground mb-1">{title}</h4>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturePanel = () => (
  <div className="vault-card overflow-hidden lg:sticky lg:top-24">
    <div className="flex items-center justify-between p-5 border-b border-border bg-secondary">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Specimen Protocol</p>
        <h3 className="text-lg font-black italic text-foreground" style={{ fontFamily: "'Georgia',serif" }}>
          Why it works
        </h3>
      </div>
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-lg">🌿</div>
    </div>

    <div className="flex flex-col gap-3.5 p-5">
      {FEATURES.map(({ emoji, label, sub }) => (
        <div key={label} className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent border border-border flex items-center justify-center text-base shrink-0">
            {emoji}
          </div>
          <div>
            <p className="text-sm font-black text-foreground mb-0.5">{label}</p>
            <p className="text-xs text-muted-foreground font-medium">{sub}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="p-4 pt-0">
      <p className="text-xs text-muted-foreground font-medium leading-relaxed text-center pl-2.5 border-l-2 border-primary">
        Every transaction is designed to be seamless — from your first visit to your plant's arrival.
      </p>
    </div>
  </div>
);

export default BotanicalProtocol;