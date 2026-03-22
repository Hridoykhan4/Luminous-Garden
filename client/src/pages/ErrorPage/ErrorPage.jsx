import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate } from "react-router";
import { TbArrowLeft, TbHome, TbAlertTriangle } from "react-icons/tb";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";

const ErrorPage = () => {
  const navigate = useNavigate();
  const container = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1 } });

      tl.from(".error-icon", { scale: 0, rotation: -45, opacity: 0 })
        .from(".error-text", { y: 30, opacity: 0, stagger: 0.1 }, "-=0.6")
        .from(".error-actions", { y: 20, opacity: 0 }, "-=0.4");

      // Infinite gentle float for the icon
      gsap.to(".error-icon", {
        y: -10,
        duration: 3,
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
      className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 w-96 h-96 bg-destructive/5 rounded-full blur-[120px]" />

      <div className="container-page flex flex-col items-center text-center">
        {/* 1. ICON SECTION */}
        <div className="error-icon mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-slow" />
          <div className="relative p-6 rounded-full bg-secondary/30 border border-primary/20 text-primary">
            <TbAlertTriangle size={48} strokeWidth={1.5} />
          </div>
        </div>

        {/* 2. TEXT SECTION */}
        <div className="max-w-md space-y-4">
          <h1 className="error-text text-5xl md:text-6xl font-black italic title-gradient tracking-tighter">
            Path <br /> <span className="text-primary">Obstructed.</span>
          </h1>
          <p className="error-text text-muted-foreground font-medium text-lg leading-relaxed px-4">
            It seems this botanical specimen or route doesn't exist in our
            current inventory.
          </p>
        </div>

        {/* 3. ACTION BUTTONS */}
        <div className="error-actions mt-12 flex flex-col sm:flex-row items-center gap-4">
          {/* Secondary Action: Go Back */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-2 px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all active:scale-95"
          >
            <TbArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
            Previous State
          </button>

          {/* Primary Action: Home */}
          <LuminousButton onClick={() => navigate("/")}>
            <TbHome className="text-lg" />
            Return to Hub
          </LuminousButton>
        </div>

        {/* 4. FOOTER NOTE */}
        <p className="error-text mt-16 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
          Error Reference: 404-Specimen-Not-Found
        </p>
      </div>
    </section>
  );
};

export default ErrorPage;
