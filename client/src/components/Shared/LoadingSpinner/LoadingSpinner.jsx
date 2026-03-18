import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import logo from "@/assets/images/logoPlants.png";
const LoadingSpinner = () => {
    const container = useRef()
    const logoRef = useRef();
    useGSAP(() => {
    gsap.to(logoRef.current, {
      rotation: 360,
      duration: 3,
      repeat: -1,
      ease: "none",
    });

    // Soothing Breathing effect
    gsap.to(logoRef.current, {
      scale: 1.1,
      opacity: 0.8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: container });
    return (
      <div
        ref={container}
        className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4"
      >
        <div className="relative">
          {/* Outer Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
          <img
            ref={logoRef}
            src={logo}
            alt="Luminous Logo"
            className="relative h-20 w-20 object-contain shadow-2xl"
          />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-secondary">
          <div className="animate-loading-bar h-full w-full bg-primary origin-left" />
        </div>
      </div>
    );
};

export default LoadingSpinner;