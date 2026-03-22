import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useAuth from "@/hooks/useAuth";
import ActionLinks from "../Shared/ActionLinks/ActionLinks";
import heroImg from "../../assets/images/heroImg.webp";
import useUserRole from "@/hooks/useUserRole";
const Hero = () => {
  const { loading: authLoading } = useAuth();
  const {role, isRoleLoading} = useUserRole();
  const container = useRef(null);
  const plantRef = useRef(null);
  const isSyncing = authLoading || isRoleLoading;

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.2 },
      });

      tl.from(".hero-text", { y: 100, opacity: 0, stagger: 0.1 })
        .from(".hero-visual", { scale: 0.8, opacity: 0, x: 40 }, "-=0.8")
        .from(".floating-card", { opacity: 0, y: 20 }, "-=0.4");

      // Infinite float
      gsap.to(plantRef.current, {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative min-h-[90vh] flex items-center pt-8 md:pt-16  overflow-hidden"
    >
      <div className="absolute top-[-10%] right-[-5%] -z-10 w-full max-w-3xl aspect-square bg-primary/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[-5%] -z-10 w-full max-w-xl aspect-square bg-secondary/20 rounded-full blur-[100px]" />

      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-10">
          <div className="hero-text overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                Global Specimen Hub
              </span>
            </div>
          </div>

          <h1 className="hero-text text-7xl md:text-[10rem] font-black tracking-[ -0.05em] leading-[0.8] title-gradient">
            Evolve <br />
            <span className="italic font-light text-primary">Nature.</span>
          </h1>

          <p className="hero-text text-muted-foreground text-lg md:text-xl font-medium max-w-lg leading-relaxed">
            Premium botanical assets for the modern collector. Secure your rare
            specimen through Bangladesh’s most advanced nursery network.
          </p>

          <div className="hero-text pt-6">
            {isSyncing ? (
              <div className="h-14 w-40 bg-primary/10 rounded-2xl animate-pulse border border-primary/20" />
            ) : (
              <ActionLinks role={role} isRoleLoading={isRoleLoading} />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative hero-visual">
          <div className="relative z-10 w-full flex justify-center lg:justify-end">
            <img
              ref={plantRef}
              src={heroImg}
              alt="Premium Specimen"
              className="w-full max-w-md md:max-w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)]"
            />
          </div>

          <div className="floating-card glass absolute -bottom-3  md:-left-10 p-6 rounded-4xl border-white/20 z-20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Verification
                </span>
              </div>
              <p className="text-xl font-black italic text-foreground leading-none">
                100% Organic
              </p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] font-bold text-primary uppercase leading-none">
                  Market Demand
                </p>
                <p className="text-lg font-black text-foreground">Extreme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
