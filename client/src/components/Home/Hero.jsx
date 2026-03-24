/* eslint-disable no-unused-vars */
import { useRef, memo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TbLeaf, TbStar, TbShield, TbArrowRight } from "react-icons/tb";
import heroImg from "../../assets/images/heroImg.webp";
import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
import ActionLinks from "../Shared/ActionLinks/ActionLinks";

gsap.registerPlugin(ScrollTrigger);

/* ── static data — defined outside so they never re-create ── */
const TRUST_BADGES = [
  { icon: TbLeaf, label: "100% Organic", sub: "Certified growth" },
  { icon: TbStar, label: "Elite Growers", sub: "Vetted nurseries" },
  { icon: TbShield, label: "Secure Checkout", sub: "SSL encrypted" },
];

/* ════════════════════════════════════════════
   HERO
════════════════════════════════════════════ */
const Hero = () => {
  const { loading: authLoading } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const rootRef = useRef(null);
  const plantRef = useRef(null);
  const glowRef = useRef(null);
  const isSyncing = authLoading || isRoleLoading;

  useGSAP(
    () => {
      /* ── single master timeline, all in one paint pass ── */
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.05 });

      tl.from(".h-eyebrow", { y: 20, opacity: 0, duration: 0.8 }, 0)
        .from(".h-line-1", { yPercent: 115, opacity: 0, duration: 1.0 }, 0.1)
        .from(".h-line-2", { yPercent: 115, opacity: 0, duration: 1.0 }, 0.22)
        .from(".h-desc", { y: 18, opacity: 0, duration: 0.8 }, 0.55)
        .from(".h-cta", { y: 14, opacity: 0, duration: 0.75 }, 0.68)
        .from(
          ".h-badge",
          { y: 16, opacity: 0, stagger: 0.07, duration: 0.7 },
          0.72,
        )
        .from(
          ".h-img-wrap",
          { clipPath: "inset(0 100% 0 0)", duration: 1.15, ease: "expo.inOut" },
          0.18,
        )
        .from(
          ".h-float-card",
          { x: 36, opacity: 0, duration: 0.8, ease: "back.out(1.4)" },
          0.9,
        )
        .from(".h-stat-pill", { y: 18, opacity: 0, duration: 0.7 }, 0.95)
        .from(".h-scroll-cue", { opacity: 0, y: 8, duration: 0.6 }, 1.4);

      /* ── continuous float (GPU-only transform) ── */
      gsap.to(plantRef.current, {
        y: -18,
        rotation: 1.2,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* ── glow breathe ── */
      gsap.to(glowRef.current, {
        scale: 1.18,
        opacity: 0.55,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* ── lightweight mouse parallax (throttled via gsap ticker) ── */
      let mouseX = 0,
        mouseY = 0;
      const onMouse = (e) => {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
      };
      const ticker = () => {
        gsap.to(".h-parallax-bg", {
          x: mouseX * 28,
          y: mouseY * 18,
          duration: 1.4,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(plantRef.current, {
          x: mouseX * 12,
          duration: 2,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(".h-float-card", {
          x: -mouseX * 9,
          y: -mouseY * 6,
          duration: 2.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      gsap.ticker.add(ticker);
      window.addEventListener("mousemove", onMouse, { passive: true });

      /* ── scroll parallax — single instance, no per-frame style ── */
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "+=600",
        onUpdate: (s) => {
          gsap.set(".h-headline-block", { y: s.progress * 35 });
          gsap.set(plantRef.current, { y: -18 + s.progress * -45 });
        },
      });

      return () => {
        window.removeEventListener("mousemove", onMouse);
        gsap.ticker.remove(ticker);
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "100svh", padding: "88px 0 56px" }}
    >
      {/* ── Ambient background ── */}
      <div
        className="h-parallax-bg"
        style={{
          position: "absolute",
          inset: "-6%",
          zIndex: 0,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        {/* mesh gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: [
              "radial-gradient(ellipse 68% 58% at 76% 28%, oklch(0.87 0.07 160 / 0.5) 0%, transparent 62%)",
              "radial-gradient(ellipse 48% 65% at 8% 82%,  oklch(0.9  0.05 155 / 0.38) 0%, transparent 58%)",
              "radial-gradient(ellipse 38% 38% at 50% 8%,  oklch(0.84 0.08 140 / 0.22) 0%, transparent 52%)",
            ].join(","),
          }}
        />
        {/* subtle noise grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.022,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
        {/* decorative rings */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid oklch(0.55 0.14 160 / 0.14)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "11%",
            right: "10%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            border: "1px solid oklch(0.55 0.14 160 / 0.09)",
          }}
        />
      </div>

      {/* Glow orb */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          right: "14%",
          width: 580,
          height: 580,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.62 0.18 160 / 0.13) 0%, transparent 70%)",
          filter: "blur(28px)",
          zIndex: 0,
          willChange: "transform, opacity",
        }}
      />

      {/* ── Main content grid ── */}
      <div className="container-page relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_430px] xl:grid-cols-[1fr_490px] gap-10 lg:gap-16 items-center">
          {/* ══ LEFT: Copy ══ */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <div className="h-eyebrow mb-7">
              <span className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-border bg-card shadow-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em]">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-current"
                    style={{ animation: "h-blink 2s ease-in-out infinite" }}
                  />
                  Live
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Botanical Marketplace · Bangladesh
                </span>
              </span>
            </div>

            {/* Headline */}
            <div
              className="h-headline-block mb-7"
              style={{ willChange: "transform" }}
            >
              {/* Line 1 — overflow clip trick for word reveal */}
              <div style={{ overflow: "hidden", lineHeight: 0.88 }}>
                <h1
                  className="h-line-1"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "clamp(3.4rem, 9vw, 8rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.045em",
                    color: "var(--foreground)",
                    margin: 0,
                    padding: "0 0 4px",
                    display: "block",
                  }}
                >
                  Evolve
                </h1>
              </div>
              {/* Line 2 */}
              <div style={{ overflow: "hidden", lineHeight: 0.88 }}>
                <h1
                  className="h-line-2"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "clamp(3.4rem, 9vw, 8rem)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    letterSpacing: "-0.04em",
                    margin: 0,
                    padding: "4px 0 0",
                    display: "block",
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, oklch(0.52 0.18 148) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Your Nature.
                </h1>
              </div>
            </div>

            {/* Description */}
            <p
              className="h-desc text-muted-foreground mb-9"
              style={{
                fontSize: "clamp(15px, 1.8vw, 17px)",
                lineHeight: 1.78,
                maxWidth: 460,
              }}
            >
              Rare organic specimens from elite local growers. Built for
              collectors who understand that a plant isn't decoration — it's a{" "}
              <span className="text-foreground font-bold">
                living investment
              </span>
              .
            </p>

            {/* CTA */}
            <div className="h-cta mb-10">
              {isSyncing ? (
                <div
                  className="h-12 w-48 rounded-2xl bg-secondary border border-border"
                  style={{ animation: "h-pulse 1.5s ease-in-out infinite" }}
                />
              ) : (
                <ActionLinks role={role} isRoleLoading={isRoleLoading} />
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2.5">
              {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="h-badge flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-border bg-card hover:border-primary hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT: Visual ══ */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Plant image */}
            <div
              className="h-img-wrap relative z-10 w-full rounded-[28px] overflow-hidden border border-border"
              style={{
                maxWidth: 440,
                aspectRatio: "3 / 4",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.07)",
              }}
            >
              <img
                ref={plantRef}
                src={heroImg}
                alt="Premium botanical specimen"
                decoding="async"
                fetchPriority="high"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 20%",
                  willChange: "transform",
                  filter: "saturate(1.07) contrast(1.02)",
                }}
              />

              {/* Bottom gradient + label */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 45%)",
                  pointerEvents: "none",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span
                  className="text-white text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  Featured Specimen
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <TbLeaf size={17} color="white" />
                </div>
              </div>
            </div>

            {/* ── Floating quality card ── */}
            <div
              className="h-float-card absolute z-20"
              style={{
                bottom: "9%",
                left: "-4%",
                width: 200,
                padding: "18px",
                borderRadius: 22,
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow:
                  "0 20px 56px rgba(0,0,0,0.11), 0 4px 14px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full bg-primary shrink-0"
                  style={{ boxShadow: "0 0 0 3px var(--secondary)" }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  Growth Certified
                </span>
              </div>
              <p
                className="text-foreground font-black italic mb-1 leading-none"
                style={{ fontFamily: "'Georgia', serif", fontSize: 20 }}
              >
                100% Organic
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-4">
                Verified by PCIU Labs
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                {[
                  { l: "Demand", v: "Peak" },
                  { l: "Rarity", v: "Mythic" },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-muted-foreground mb-1">
                      {l}
                    </p>
                    <p
                      className="text-base font-black text-foreground"
                      style={{
                        fontFamily: "'Georgia', serif",
                        color: l === "Rarity" ? "var(--primary)" : undefined,
                      }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Stat pill — top right ── */}
            <div
              className="h-stat-pill absolute z-20 text-center"
              style={{
                top: "6%",
                right: "-3%",
                padding: "12px 14px",
                borderRadius: 18,
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 32px rgba(0,0,0,0.08)",
                minWidth: 80,
              }}
            >
              <p
                className="font-black text-primary leading-none mb-1"
                style={{ fontFamily: "'Georgia', serif", fontSize: 26 }}
              >
                500+
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Specimens
              </p>
            </div>
          </div>
        </div>

        {/* ── Scroll cue ── */}
        <div className="h-scroll-cue flex flex-col items-center gap-2 mt-16">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
            Explore
          </span>
          <div
            className="flex items-start justify-center pt-1.5"
            style={{
              width: 32,
              height: 52,
              borderRadius: 999,
              border: "1.5px solid var(--border)",
            }}
          >
            <div
              className="w-1 h-3 rounded-full bg-primary"
              style={{ animation: "h-scroll-dot 1.9s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* ── Responsive overrides + keyframes ── */}
      <style>{`
        @keyframes h-blink      { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes h-pulse      { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes h-scroll-dot { 0%{transform:translateY(0);opacity:1} 55%{transform:translateY(20px);opacity:0} 56%{transform:translateY(0);opacity:0} 100%{opacity:1} }

        /* Hide floating card on tablet — it overlaps */
        @media (max-width: 1023px) {
          .h-float-card { display: none !important; }
          .h-img-wrap   { max-width: 360px !important; }
        }
        /* Mobile: landscape image ratio, hide stat pill */
        @media (max-width: 767px) {
          .h-img-wrap   { max-width: 100% !important; aspect-ratio: 4/3 !important; border-radius: 20px !important; }
          .h-stat-pill  { display: none !important; }
        }
        /* Prevent giant headline overflow on very small screens */
        @media (max-width: 380px) {
          .h-line-1, .h-line-2 { font-size: 3rem !important; }
        }
      `}</style>
    </section>
  );
};

export default memo(Hero);
