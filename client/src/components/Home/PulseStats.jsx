import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePlants from "@/hooks/usePlants";

gsap.registerPlugin(ScrollTrigger);

const PulseStats = () => {
  const container = useRef(null);

  // Fetching with a limit of 1 because we only need the 'stats' & 'meta' objects
  const { data: response, isLoading } = usePlants({ limit: 1 });

  // Extracting data from the SaaS-grade backend structure
  const totalCount = response?.meta?.totalCount || 0;
  const uniqueSellers = response?.stats?.uniqueSellers || 0;
  const totalStock = response?.stats?.totalStock || 0;

  useGSAP(
    () => {
      if (isLoading) return;

      const numbers = gsap.utils.toArray(".stat-number");
      numbers.forEach((num) => {
        const target = parseInt(num.getAttribute("data-target")) || 0;

        gsap.fromTo(
          num,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: "expo.out",
            scrollTrigger: {
              trigger: num,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: container, dependencies: [isLoading, totalCount] },
  );

  const stats = [
    { label: "Verified Specimens", value: totalCount, suffix: "+" },
    { label: "Elite Growers", value: uniqueSellers, suffix: "" },
    { label: "Global Inventory", value: totalStock, suffix: " units" },
  ];

  return (
    <section
      ref={container}
      className="relative section-spacing overflow-hidden bg-secondary/10 border-y border-slate-50"
    >
      {/* SaaS Visual: Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className=" relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center px-8 ${
                idx !== stats.length - 1 ? "md:border-r border-slate-100" : ""
              }`}
            >
              {isLoading ? (
                // Professional Skeleton State
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="h-12 w-24 bg-slate-100 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-slate-50 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <div className="flex items-baseline font-mono text-6xl font-medium text-slate-900 tracking-tighter">
                      <span className="stat-number" data-target={stat.value}>
                        0
                      </span>
                      <span className="text-lg font-bold text-emerald-500 ml-1">
                        {stat.suffix}
                      </span>
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute -top-1 -right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                      {stat.label}
                    </p>
                    <div className="w-6 h-[2px] bg-emerald-500/20 mx-auto" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PulseStats;
