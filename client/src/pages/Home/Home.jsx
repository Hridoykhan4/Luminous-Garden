import { lazy, Suspense, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/Home/Hero";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";
import PlantCard from "@/components/Shared/PlantCard";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
const PulseStats = lazy(() => import("../../components/Home/PulseStats"));
const TrustPillar = lazy(() => import("../../components/Home/TrustPillar"));
const BotanicalProtocol = lazy(() => import('../../components/Home/BotanicalProtocol'))

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { data: response = {}, isLoading } = usePlants("", 8);
  const featuredPlants = response?.data || [];
  const totalCount = response?.count || 0;
  const container = useRef(null);

  return (
    <main ref={container} className="relative bg-[#FAFAF9]">
      <div className="absolute top-0 right-0 w-100 h-100 bg-emerald-100/40 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-[20%] left-0 w-75 h-75 bg-teal-100/30 blur-[100px] rounded-full -z-10" />

      <div className="container-page">
        <Hero />
        {/* --- INVENTORY SECTION --- */}
        <section id="explore" className="section-spacing pt-10">
          <SectionTitle
            heading="Curated Inventory"
            subheading="Verified botanical specimens from elite local growers."
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <PlantSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredPlants.map((plant) => (
                <div
                  key={plant._id}
                  className="plant-card-wrapper perspective-1000"
                >
                  <PlantCard plant={plant} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && featuredPlants?.length > 0 && (
            <div className="md:mt-20 mt-12 flex flex-col items-center gap-6">
              <LuminousButton to="/plants">
                Explore Full Marketplace
              </LuminousButton>

              <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">
                  {totalCount} Specimens Live Now
                </p>
              </div>
            </div>
          )}
        </section>

        <Suspense fallback={<LoadingSpinner/>}>

        {/* --- TRUST PILLARS SECTION --- */}
        <section className="section-spacing ">
          <TrustPillar></TrustPillar>
        </section>

        {/* --- How It Works Section --- */}
        <section className="section-spacing ">
          <BotanicalProtocol></BotanicalProtocol>
        </section>

        {/* Pulse Stats Count */}
        <section className="section-spacing ">
          <PulseStats></PulseStats>
        </section>

        </Suspense>

      </div>
    </main>
  );
};

export default Home;
