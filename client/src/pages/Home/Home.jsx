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
  const { data: response = {}, isLoading } = usePlants("", 8);
  const featuredPlants = response?.data || [];
  const totalCount = response?.count || 0;
  const container = useRef(null);

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
                <div key={plant._id} className="plant-card-wrapper">
                  <PlantCard plant={plant} />
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Action Area */}
          {!isLoading && featuredPlants?.length && (
            <div className="md:mt-16 mt-10 flex flex-col items-center gap-6">
              <LuminousButton to="/plants">
                Explore Full Marketplace
              </LuminousButton>

              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Showing {featuredPlants.length} of {totalCount} available
                specimens
              </p>
            </div>
          )}
        </section>

        <section className="section-spacing">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat quo
          esse sint. Reiciendis optio tempora placeat quia sit incidunt porro
          error, cumque deleniti, repellendus ducimus repellat voluptas quaerat
          odit totam similique architecto dignissimos earum itaque? Dolore,
          consequuntur reprehenderit deserunt atque cum nostrum. Quasi
          laboriosam in asperiores rerum quos cum odit, ad sit! Error tempora
          quisquam alias magni quo rerum molestiae magnam eos doloremque
          dolores. Architecto id eos atque ipsum! Labore itaque tenetur magni id
          inventore nesciunt nam dicta corporis expedita ipsa! Tempore quae fuga
          impedit tenetur corrupti! Quam ratione distinctio eos et ut, optio
          consectetur assumenda asperiores libero nostrum temporibus.
        </section>
      </div>
    </main>
  );
};

export default Home;
