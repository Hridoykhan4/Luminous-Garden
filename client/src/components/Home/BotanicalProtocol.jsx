import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  TbUserPlus,
  TbSearch,
  TbPlant,
  TbPackageExport,
  TbWallet,
} from "react-icons/tb";
import { cn } from "@/lib/utils";
import SectionTitle from "../Shared/SectionTitle/SectionTitle";

const BotanicalProtocol = () => {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.from(".step-card", {
        opacity: 0,
        x: (i) => (i % 2 === 0 ? -50 : 50), // Alternating slide-in
        stagger: 0.2,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        },
      });
    },
    { scope: container },
  );

  const steps = [
    {
      icon: TbUserPlus,
      title: "Initialize Account",
      desc: "Select your role: Collector or Professional Grower.",
      side: "left",
    },
    {
      icon: TbSearch,
      title: "Discover Specimen",
      desc: "Browse DNA-verified listings with high-res captures.",
      side: "right",
    },
    {
      icon: TbPlant,
      title: "Secure Acquisition",
      desc: "Funds held in escrow until botanical health is confirmed.",
      side: "left",
    },
    {
      icon: TbPackageExport,
      title: "Priority Deployment",
      desc: "Climate-controlled transit to your coordinates.",
      side: "right",
    },
  ];

  return (
    <section ref={container} className="relative">
      <SectionTitle
        heading="The Botanical Protocol"
        subheading="Precision engineering from soil to doorstep."
      />

      <div className="max-w-5xl mx-auto relative">
        {/* The "Root" Line - Visual Connection */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-emerald-500/50 via-emerald-200 to-transparent hidden md:block" />

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "step-card flex flex-col md:flex-row items-center gap-8 md:gap-20",
                idx % 2 !== 0 && "md:flex-row-reverse",
              )}
            >
              {/* Content Box */}
              <div
                className={cn(
                  "flex-1 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl transition-all duration-500 group",
                  idx % 2 === 0 ? "md:text-right" : "md:text-left",
                )}
              >
                <div
                  className={cn(
                    "size-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform",
                    idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto",
                  )}
                >
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Number/Indicator */}
              <div className="relative z-10 size-12 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center font-black text-emerald-600 shadow-xl">
                {idx + 1}
              </div>

              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BotanicalProtocol;
