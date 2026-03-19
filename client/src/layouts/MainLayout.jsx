import { useEffect } from "react";
import { Outlet } from "react-router";
import Lenis from "@studio-freight/lenis";
import Navbar from "../components/Shared/Navbar/Navbar";
import Footer from "../components/Shared/Footer/Footer";

const MainLayout = () => {
  useEffect(() => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    
    return () => lenis.destroy(); 
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow"> 
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout