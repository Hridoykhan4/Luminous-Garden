import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Hero from "@/components/Home/Hero";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import PlantCard from "@/components/Shared/PlantCard";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";
import TrustPillar from "@/components/Home/TrustPillar";
import BotanicalProtocol from "@/components/Home/BotanicalProtocol";
import PulseStats from "@/components/Home/PulseStats";
import usePlants from "@/hooks/usePlants";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { data: response = {}, isLoading, refetch } = usePlants({ limit: 8 });
  const featuredPlants = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const inventoryRef = useRef(null);

  /* Cards entrance when they enter viewport */
  useGSAP(() => {
    if (isLoading || !featuredPlants.length) return;
    gsap.set(".home-plant-card", { clearProps: "all" });
    ScrollTrigger.create({
      trigger: inventoryRef.current,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.fromTo(".home-plant-card",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.055, duration: 0.6, ease: "expo.out", clearProps: "transform,opacity" }
        ),
    });
  }, [isLoading, featuredPlants.length]);

  return (
    <main className="relative overflow-x-hidden bg-background">

      {/* Ambient light blobs — fixed, behind everything, subtle */}
      <div
        className="fixed top-0 right-0 pointer-events-none -z-10 rounded-full"
        style={{ width: 380, height: 380, background: "radial-gradient(circle, oklch(0.88 0.06 160 / 0.28) 0%, transparent 70%)", filter: "blur(80px)" }}
        aria-hidden
      />
      <div
        className="fixed pointer-events-none -z-10 rounded-full"
        style={{ top: "20%", left: 0, width: 300, height: 300, background: "radial-gradient(circle, oklch(0.90 0.05 180 / 0.18) 0%, transparent 70%)", filter: "blur(80px)" }}
        aria-hidden
      />

      {/* Hero */}
      <Hero />

      <div className="container-page">

        {/* ── Featured Inventory ── */}
        <section ref={inventoryRef} id="explore" className="section-spacing">
          <SectionTitle
            heading="Curated Inventory"
            subheading="Verified botanical specimens from elite local growers."
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <PlantSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredPlants.map(plant => (
                <div key={plant._id} className="home-plant-card">
                  <PlantCard refetch={refetch} plant={plant} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && featuredPlants.length > 0 && (
            <div className="flex flex-col items-center gap-4 mt-12 md:mt-16">
              <LuminousButton to="/plants">Explore Full Marketplace</LuminousButton>

              {/* Live count pill */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  {totalCount} Specimens Live Now
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Trust Pillars ── */}
        <TrustPillar />

        {/* ── How It Works ── */}
        <BotanicalProtocol />

        {/* ── Stats ── */}
        <PulseStats />

      </div>
    </main>
  );
};

export default Home;