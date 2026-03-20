import { Suspense, lazy } from "react";
import Hero from "@/components/Home/Hero";
import useAuth from "@/hooks/useAuth";
import SectionTitle from "@/components/Shared/SectionTitle/SectionTitle";
import { Button } from "@/components/ui/button";
import { TbArrowRight } from "react-icons/tb";

const Plants = lazy(() => import("../../components/Home/Plants"));

const Home = () => {
  const { user } = useAuth();

  return (
    <main className="relative">
      <div className="container-page space-y-24 pb-32">
        {/* HERO: The Entry Point */}
        <Hero />

        {/* PLANTS GRID */}
        <section id="explore" className="section-spacing">
          <SectionTitle
            heading="Curated Inventory"
            subheading="Verified botanical specimens from local growers."
          />
          <Suspense
            fallback={
              <div className="h-96 w-full animate-pulse bg-muted/20 rounded-3xl" />
            }
          >
            <Plants />
          </Suspense>
        </section>

        {/* ROLE BASED CTA */}
        <section className="section-spacing">
          {!user || user?.role === "customer" ? (
            <div className="bg-foreground rounded-[3rem] p-12 text-center text-background relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
              <h2 className="text-5xl font-black mb-6 italic tracking-tighter">
                Start Your <span className="text-primary">Nursery Empire.</span>
              </h2>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-8 rounded-2xl font-black text-lg shadow-2xl transition-all hover-lift">
                Become a Seller <TbArrowRight className="ml-2" size={24} />
              </Button>
            </div>
          ) : (
            <div className="glass rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight italic">
                  Inventory Manager
                </h2>
                <p className="text-muted-foreground font-medium italic">
                  Monitor your nursery's performance across Bangladesh.
                </p>
              </div>
              <Button className="mt-8 md:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 rounded-2xl font-black">
                Seller Dashboard
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
