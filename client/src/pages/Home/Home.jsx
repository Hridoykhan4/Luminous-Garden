import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Hero from "@/components/Home/Hero";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";
import PlantCard from "@/components/Shared/PlantCard";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";


const Home = () => {
  const { data: plants, isLoading } = usePlants();
  const container = useRef(null);
  const featuredPlants = plants?.slice(0, 8) || [];

  useGSAP(
    () => {
      if (!isLoading && featuredPlants.length > 0) {
        gsap.from(".plant-card-wrapper", {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "expo.out",
          clearProps: "all", 
        });
      }
    },
    { dependencies: [isLoading], scope: container },
  );

  return (
    <main ref={container} className="relative">
      <div className="container-page pb-20">
        <Hero />

        <section id="explore" className="section-spacing">
          <SectionTitle
            heading="Curated Inventory"
            subheading="Verified botanical specimens from local growers."
          />

          {isLoading ? (
            <PlantSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredPlants.map((plant) => (
                // Wrapper div to handle the entrance animation safely
                <div key={plant._id} className="plant-card-wrapper">
                  <PlantCard plant={plant} />
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Action Area */}
          {!isLoading && plants?.length > 8 && (
            <div className="mt-20 flex flex-col items-center gap-6">
              <LuminousButton to="/plants">
                Explore Full Marketplace
              </LuminousButton>

              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Showing {featuredPlants.length} of {plants.length} available
                specimens
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
