import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TbSearch, TbArrowRight } from "react-icons/tb";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const container = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1.2 },
      });

      // Entrance animations
      tl.from(".hero-badge", { opacity: 0, y: -20, duration: 0.8 })
        .from(".hero-title span", { y: 100, opacity: 0, stagger: 0.1 }, "-=0.6")
        .from(".hero-desc", { opacity: 0, x: -30 }, "-=0.8")
        .from(".hero-search", { opacity: 0, scale: 0.9, y: 20 }, "-=0.8")
        .from(imageRef.current, { opacity: 0, scale: 0.8, x: 50 }, "-=1");

      // Infinite Floating for the plant (GSAP is smoother for this than CSS)
      gsap.to(imageRef.current, {
        y: -20,
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
      className="relative min-h-[85vh] flex items-center pt-10 overflow-hidden"
    >
      {/* Dynamic Background Mesh (Using your OKLCH vars) */}
      <div className="absolute top-[-10%] right-[-10%] -z-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-[-5%] -z-10 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px]" />

      <div className="container-page grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT: CONTENT */}
        <div className="space-y-8">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Live from Chittagong Nurseries
            </span>
          </div>

          <h1 className="hero-title text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] title-gradient">
            <span className="block">Pure</span>
            <span className="block italic text-primary">Botanical</span>
            <span className="block">Luxury.</span>
          </h1>

          <p className="hero-desc text-lg text-muted-foreground max-w-lg font-medium leading-relaxed">
            Luminous Garden is Bangladesh’s first high-performance plant SaaS.
            Connect with premium sellers and secure rare specimens for your
            collection.
          </p>

          {/* Search Bar with your .glass utility */}
          <div className="hero-search relative max-w-md group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all rounded-2xl" />
            <div className="glass relative flex items-center p-2 rounded-2xl border-white/20">
              <TbSearch className="ml-4 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search premium specimen..."
                className="w-full bg-transparent px-4 outline-none font-medium text-foreground placeholder:text-muted-foreground/50"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                Explore
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: THE SPECIMEN */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 m-auto w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />

          <img
            ref={imageRef}
            src="https://res.cloudinary.com/djujnfiwa/image/upload/v1740050000/premium-monstera.png"
            alt="Monstera Deliciosa"
            className="relative z-10 w-full max-w-[550px] drop-shadow-[0_50px_50px_rgba(0,0,0,0.12)] object-contain"
          />

          {/* Data Tag using your .glass utility */}
          <div className="glass absolute bottom-10 left-0 md:-left-10 p-5 rounded-2xl border-white/20 animate-float">
            <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1">
              Stock Level: High
            </p>
            <p className="text-xl font-black italic text-foreground leading-none">
              Thai Constellation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
