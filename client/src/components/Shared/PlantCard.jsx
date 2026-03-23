import { useRef } from "react";
import gsap from "gsap";
import {
  TbEdit,
  TbTrash,
  TbEye,
  TbActivity,
  TbAlertTriangle,
} from "react-icons/tb";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import LuminousButton from "./LuminousButton/LuminousButton";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const PlantCard = ({ plant, refetch }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const axiosSecure = useAxiosSecure();
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const isOwner = user?.email === plant?.seller?.email;
  const isOutOfStock = plant?.quantity === 0;
  const isAdmin = role === "admin";
  const isFlagged = plant.status === "flagged";

  const onMouseEnter = () => {
    gsap.to(cardRef.current, { y: -10, duration: 0.4, ease: "power2.out" });
    gsap.to(imageRef.current, {
      scale: 1.1,
      duration: 1.2,
      ease: "power2.out",
    });
  };

  const onMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: "power2.out" });
    gsap.to(imageRef.current, { scale: 1, duration: 0.8, ease: "power2.out" });
  };

  const handleTerminate = async () => {
    if (!window.confirm("PROTOCOL: Restrict this asset from public view?"))
      return;

    try {
      gsap.to(cardRef.current, {
        filter: "grayscale(100%) blur(2px)",
        opacity: 0.6,
        duration: 0.4,
      });

      const { data } = await axiosSecure.patch(`/plants/status/${plant._id}`, {
        status: "flagged",
      });

      if (data.success) {
        toast.success("Asset Restricted", {
          icon: "🚫",
          style: {
            background: "var(--destructive)",
            color: "var(--destructive-foreground)",
          },
        });
        refetch();
      }
    } catch (error) {
      console.log(error);
      gsap.to(cardRef.current, {
        filter: "grayscale(0%) blur(0px)",
        opacity: 1,
      });
      toast.error("System Override Failed");
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative bg-white dark:bg-card rounded-[2.5rem] p-4 border border-border/60 transition-all duration-500 hover:border-primary/40 shadow-sm"
    >
      {/* 1. VISUAL PORTAL */}
      <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-secondary/20">
        <img
          ref={imageRef}
          src={plant.image}
          alt={plant.name}
          className={cn(
            "w-full h-full object-cover will-change-transform transition-all duration-700",
            isFlagged && "grayscale blur-[2px] opacity-50",
          )}
        />

        {/* Flagged Overlay */}
        {isFlagged && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-destructive/10 backdrop-blur-[2px]">
            <div className="bg-destructive text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <TbAlertTriangle className="animate-pulse" /> Restricted
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
            {plant.category}
          </div>
          {isOutOfStock && !isFlagged && (
            <div className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20">
              Sold Out
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4">
          <div className="size-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <TbActivity className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. DATA BLOCK */}
      <div className="mt-6 px-2 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black italic tracking-tighter leading-none bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {plant.name}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {isOwner ? "Personal Vault" : `Origin: ${plant.seller.name}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-foreground italic tracking-tighter">
              ৳{plant.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3. CONTEXTUAL ACTIONS */}
        <div className="pt-2">
          {isAdmin ? (
            <button
              onClick={handleTerminate}
              disabled={isFlagged}
              className="w-full h-14 rounded-xl border border-destructive/30 text-destructive font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              <TbTrash className="text-lg group-hover/btn:rotate-12 transition-transform" />
              {isFlagged ? "Asset Terminated" : "Terminate Listing"}
            </button>
          ) : isOwner ? (
            <LuminousButton
              variant="outline"
              className="w-full h-14"
              to={`/dashboard/update-plant/${plant._id}`}
            >
              <TbEdit className="text-lg" /> Refine Inventory
            </LuminousButton>
          ) : (
            <Link
              to={`/plants/${plant._id}`}
              className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <TbEye size={18} /> View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
