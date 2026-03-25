/* eslint-disable no-unused-vars */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TbLeaf, TbUsers, TbStack2, TbArrowUpRight } from "react-icons/tb";
import usePlantStats from "@/hooks/usePlantStats";
import SectionTitle from "../Shared/SectionTitle/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const STAT_CONFIG = [
  {
    key: "totalCount",
    label: "Verified Specimens",
    sublabel: "Active listings, live now",
    suffix: "+",
    icon: TbLeaf,
    // accent is a LIGHT-mode ink tone: dark green tint
    accent: "oklch(0.38 0.10 160)",
    chipBg: "oklch(0.93 0.04 160)",
    chipBorder: "oklch(0.86 0.06 160)",
  },
  {
    key: "uniqueSellers",
    label: "Elite Growers",
    sublabel: "Vetted nursery partners",
    suffix: "",
    icon: TbUsers,
    accent: "oklch(0.35 0.08 200)",
    chipBg: "oklch(0.93 0.03 200)",
    chipBorder: "oklch(0.86 0.05 200)",
  },
  {
    key: "totalStock",
    label: "Units in Inventory",
    sublabel: "Ready to dispatch",
    suffix: "",
    icon: TbStack2,
    accent: "oklch(0.40 0.09 100)",
    chipBg: "oklch(0.94 0.04 100)",
    chipBorder: "oklch(0.87 0.06 100)",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const PulseStats = () => {
  const containerRef = useRef(null);
  const { data, isLoading } = usePlantStats();

  const values = {
    totalCount: data?.totalCount ?? 0,
    uniqueSellers: data?.uniqueSellers ?? 0,
    totalStock: data?.totalStock ?? 0,
  };

  useGSAP(
    () => {
      if (isLoading) return;

      /* Section label entrance */
      gsap.from(".ps-eyebrow", {
        y: 16,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
          once: true,
        },
      });

      /* Headline */
      gsap.from(".ps-headline span", {
        y: 60,
        opacity: 0,
        skewY: 4,
        stagger: 0.08,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          once: true,
        },
      });

      /* Cards */
      gsap.from(".ps-card", {
        y: 40,
        opacity: 0,
        scale: 0.97,
        stagger: 0.1,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ps-grid", start: "top 88%", once: true },
      });

      /* Count-up */
      gsap.utils.toArray(".ps-number").forEach((el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2.4,
            ease: "expo.out",
            snap: { innerText: 1 },
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          },
        );
      });
    },
    { scope: containerRef, dependencies: [isLoading, values.totalCount] },
  );

  return (
    <section
      ref={containerRef}
      className="section-spacing"
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
    >
      {/* ── Subtle background texture — light, stays on theme ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* Very faint ruled lines — newspaper / botanical journal feel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, oklch(0.88 0.03 160 / 0.35) 0px, oklch(0.88 0.03 160 / 0.35) 1px, transparent 1px, transparent 44px)",
            maskImage:
              "radial-gradient(ellipse 100% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        {/* Top edge fade from background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(to bottom, var(--background), transparent)",
          }}
        />
        {/* Bottom edge fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(to top, var(--background), transparent)",
          }}
        />
        {/* Centre soft glow — barely perceptible */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.78 0.08 160 / 0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div
        className="container-page"
        style={{ position: "relative", zIndex: 1 }}
      >
        <SectionTitle
          heading="Ecosystem Insights"
          subheading="Real-time analytics across our global network"
        />
        {/* ── Cards grid ── */}
        <div
          className="ps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {STAT_CONFIG.map(
            ({
              key,
              label,
              sublabel,
              suffix,
              icon: Icon,
              accent,
              chipBg,
              chipBorder,
            }) => (
              <StatCard
                key={key}
                label={label}
                sublabel={sublabel}
                suffix={suffix}
                icon={Icon}
                accent={accent}
                chipBg={chipBg}
                chipBorder={chipBorder}
                value={values[key]}
                isLoading={isLoading}
              />
            ),
          )}
        </div>
      </div>

      <style>{`
        @keyframes ps-blink {
          0%,100% { opacity:1; box-shadow:0 0 8px oklch(0.50 0.14 160 / 0.6) }
          50%      { opacity:.4; box-shadow:0 0 16px oklch(0.50 0.14 160 / 0.3) }
        }
        @keyframes ps-ping {
          0%   { transform:scale(1); opacity:0.7 }
          100% { transform:scale(2.6); opacity:0 }
        }
        @keyframes ps-shimmer-light {
          0%,100% { opacity:0.4 }
          50%     { opacity:0.85 }
        }
      `}</style>
    </section>
  );
};

/* ─────────────────────────────────────────────
   STAT CARD — light-surface, ink accents
───────────────────────────────────────────── */
const StatCard = ({
  label,
  sublabel,
  suffix,
  icon: Icon,
  accent,
  chipBg,
  chipBorder,
  value,
  isLoading,
}) => (
  <div
    className="ps-card"
    style={{
      padding: "32px 28px 28px",
      borderRadius: 24,
      background: "oklch(1 0 0 / 0.85)",
      border: `1px solid oklch(0.90 0.03 160 / 0.8)`,
      backdropFilter: "blur(12px)",
      boxShadow:
        "0 2px 20px oklch(0.50 0.10 160 / 0.06), 0 1px 4px oklch(0.50 0.10 160 / 0.04)",
      position: "relative",
      overflow: "hidden",
      transition:
        "box-shadow 0.28s ease, transform 0.28s ease, border-color 0.28s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow = `0 12px 40px oklch(0.50 0.10 160 / 0.10), 0 2px 8px oklch(0.50 0.10 160 / 0.06)`;
      e.currentTarget.style.borderColor = chipBorder;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 2px 20px oklch(0.50 0.10 160 / 0.06), 0 1px 4px oklch(0.50 0.10 160 / 0.04)";
      e.currentTarget.style.borderColor = "oklch(0.90 0.03 160 / 0.8)";
    }}
  >
    {/* Top accent rule */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 28,
        right: 28,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
        borderRadius: "0 0 2px 2px",
      }}
    />

    {/* Icon row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
      }}
    >
      {/* Icon chip */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          borderRadius: 10,
          background: chipBg,
          border: `1px solid ${chipBorder}`,
        }}
      >
        <Icon size={16} style={{ color: accent }} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          Live
        </span>
      </div>

      {/* Pulse dot */}
      <div style={{ position: "relative", width: 8, height: 8 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: accent,
            opacity: 0.5,
            animation: "ps-ping 2.2s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
          }}
        />
      </div>
    </div>

    {/* Number */}
    {isLoading ? (
      <div
        style={{
          height: 56,
          width: "55%",
          borderRadius: 12,
          background: "oklch(0.92 0.03 160 / 0.6)",
          animation: "ps-shimmer-light 1.6s ease-in-out infinite",
          marginBottom: 16,
        }}
      />
    ) : (
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 3,
          marginBottom: 12,
        }}
      >
        <span
          className="ps-number"
          data-target={value}
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(3rem, 5vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            color: "oklch(0.18 0.04 160)",
          }}
        >
          0
        </span>
        <span
          style={{
            fontSize: "1.4rem",
            fontWeight: 900,
            color: accent,
            lineHeight: 1,
          }}
        >
          {suffix}
        </span>
      </div>
    )}

    {/* Label */}
    {isLoading ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            height: 10,
            width: "75%",
            borderRadius: 6,
            background: "oklch(0.92 0.03 160 / 0.5)",
            animation: "ps-shimmer-light 1.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 8,
            width: "55%",
            borderRadius: 6,
            background: "oklch(0.92 0.03 160 / 0.35)",
            animation: "ps-shimmer-light 1.6s ease-in-out infinite",
          }}
        />
      </div>
    ) : (
      <>
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "oklch(0.30 0.05 160)",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "oklch(0.55 0.03 160 / 0.65)",
              fontWeight: 500,
            }}
          >
            {sublabel}
          </p>
          <TbArrowUpRight
            size={14}
            style={{ color: `${accent}`, opacity: 0.5 }}
          />
        </div>
      </>
    )}
  </div>
);

export default PulseStats;
