/* eslint-disable no-unused-vars */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useAuth from "@/hooks/useAuth";
import ActionLinks from "../Shared/ActionLinks/ActionLinks";
import heroImg from "../../assets/images/heroImg.webp";
import useUserRole from "@/hooks/useUserRole";

const Hero = () => {
  const { loading: authLoading } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const container = useRef(null);
  const plantRef = useRef(null);
  const isSyncing = authLoading || isRoleLoading;

  useGSAP(
    (context) => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 2 },
      });

      // 1. Initial Reveal
      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 1 })
        .from(
          ".hero-title",
          {
            y: 120,
            rotation: 5,
            opacity: 0,
            stagger: 0.2,
            skewY: 7,
          },
          "-=0.8",
        )
        .from(".hero-desc", { y: 20, opacity: 0 }, "-=1.2")
        .from(
          ".hero-visual",
          {
            clipPath: "inset(100% 0% 0% 0%)",
            scale: 1.2,
            opacity: 0,
          },
          "-=1.5",
        )
        .from(".floating-card", { x: 50, opacity: 0, blur: "10px" }, "-=1");

      // 2. Infinite Float
      gsap.to(plantRef.current, {
        y: -30,
        rotation: 2,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 3. Interactive Mouse Parallax
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 40;
        const yPos = (clientY / window.innerHeight - 0.5) * 40;

        gsap.to(".parallax-bg", {
          x: xPos,
          y: yPos,
          duration: 1,
          ease: "power2.out",
        });

        gsap.to(".floating-card", {
          x: -xPos * 0.5,
          y: -yPos * 0.5,
          duration: 1.5,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative min-h-screen flex items-center section-spacing overflow-hidden"
    >
      <div className="parallax-bg absolute inset-0 -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-secondary/30 rounded-full blur-[140px]" />
      </div>

      <div className="container-page grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-8 z-10">
          <div className="hero-badge overflow-hidden">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
                Live Botanical Marketplace
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="hero-title text-8xl md:text-[11rem] font-black tracking-[-0.06em] leading-[0.75] title-gradient">
              Evolve <br />
              <span className="italic font-extralight text-primary opacity-90">
                Nature.
              </span>
            </h1>
          </div>

          <p className="hero-desc text-muted-foreground text-lg md:text-2xl font-medium max-w-xl leading-relaxed">
            Curating rare organic assets for digital-first collectors. Connect
            with premium nurseries across{" "}
            <span className="text-foreground font-bold underline decoration-primary/30">
              Bangladesh
            </span>
            .
          </p>

          <div className="hero-desc pt-8">
            {isSyncing ? (
              <div className="h-16 w-48 bg-primary/10 rounded-3xl animate-pulse border border-primary/20" />
            ) : (
              <ActionLinks role={role} isRoleLoading={isRoleLoading} />
            )}
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="lg:col-span-5 relative">
          <div className="hero-visual relative z-10 w-full flex justify-center lg:justify-end">
            <img
              ref={plantRef}
              src={heroImg}
              alt="Premium Specimen"
              className="w-full max-w-lg rounded-2xl md:max-w-full drop-shadow-[0_50px_100px_rgba(0,0,0,0.15)] filter saturate-[1.1]"
            />
          </div>

          {/* NEXT-WORLD FLOATING CARD */}
          <div className="floating-card glass absolute -bottom-10 md:-left-16 p-4 lg:p-8 rounded-[3rem] border-white/20 z-20 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Growth Certified
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-3xl font-black italic text-foreground leading-none">
                  100% Organic
                </p>
                <p className="text-[10px] font-bold text-primary/60 uppercase">
                  Verified by PCIU Labs
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Demand
                  </p>
                  <p className="text-xl font-black text-foreground">Peak</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Rarity
                  </p>
                  <p className="text-xl font-black text-primary">Mythic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
