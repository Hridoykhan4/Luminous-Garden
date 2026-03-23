import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PulseStats = ({
  totalPlants = 1240,
  totalSellers = 85,
  activeOrders = 42,
}) => {
  const container = useRef(null);

  useGSAP(
    () => {
      const numbers = gsap.utils.toArray(".stat-number");

      numbers.forEach((num) => {
        const target = parseInt(num.getAttribute("data-target"));

        gsap.to(num, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 }, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: num,
            start: "top 90%",
          },
        });
      });
    },
    { scope: container },
  );

  const stats = [
    { label: "Verified Specimens", value: totalPlants, suffix: "+" },
    { label: "Elite Growers", value: totalSellers, suffix: "" },
    { label: "Active Deployments", value: activeOrders, suffix: "" },
  ];

  return (
    <section
      ref={container}
      className="py-24 border-y border-emerald-100 bg-emerald-50/30"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="flex items-baseline text-6xl font-black text-slate-900 tracking-tighter">
                <span className="stat-number" data-target={stat.value}>
                  0
                </span>
                <span className="text-emerald-500">{stat.suffix}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PulseStats;
