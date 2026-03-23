import { useRef } from "react";
import gsap from "gsap";
import { TbEdit, TbTrash, TbShoppingCart, TbEye, TbLeaf } from "react-icons/tb";
import useUserRole from "@/hooks/useUserRole";
import useAuth from "@/hooks/useAuth";
import LuminousButton from "./LuminousButton/LuminousButton";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

const PlantCard = ({ plant }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const isOwner = user?.email === plant?.seller?.email;
  const isOutOfStock = plant?.quantity === 0;

  const onMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -12,
      duration: 0.6,
      ease: "expo.out",
      boxShadow: "0 30px 60px -15px rgba(0,0,0,0.15)",
    });
    gsap.to(imageRef.current, {
      scale: 1.1,
      duration: 1.2,
      ease: "power2.out",
    });
  };

  const onMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.6,
      ease: "expo.out",
      boxShadow: "0 0px 0px 0px rgba(0,0,0,0)",
    });
    gsap.to(imageRef.current, { scale: 1, duration: 0.8, ease: "power2.out" });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative bg-card rounded-[2.5rem] p-4 border border-border/40 transition-colors hover:border-primary/40"
    >
      {/* 1. VISUAL ANCHOR */}
      <div className="relative aspect-4/5 overflow-hidden rounded-4xl bg-secondary/10">
        <img
          ref={imageRef}
          src={plant.image}
          alt={plant.name}
          className="w-full h-full object-cover transition-transform"
        />

        {/* Category Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="px-3 py-1 bg-background/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
            {plant.category}
          </div>
          {isOutOfStock && (
            <div className="px-3 py-1 bg-destructive text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              Sold Out
            </div>
          )}
        </div>

        {/* Quick Stock Indicator */}
        {!isOutOfStock && (
          <div
            className={cn(
              "absolute bottom-4 left-4 right-4 flex justify-between items-end transition-all duration-500 ease-out",
              "opacity-100 translate-y-0",
              "lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0",
            )}
          >
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] text-white font-bold flex items-center gap-2 shadow-2xl">
              <TbLeaf className="text-emerald-400 animate-pulse" />
              <span className="tracking-wider">{plant.quantity} IN STOCK</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. SPECIMEN DATA */}
      <div className="mt-6 px-2 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black italic tracking-tighter title-gradient leading-none">
              {plant.name}
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              By{" "}
              {isOwner ? (
                <span className="text-primary">You (Grower)</span>
              ) : (
                plant.seller.name
              )}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-foreground leading-none">
              ${plant.price}
            </span>
          </div>
        </div>

        {/* 3. CONTEXTUAL ACTIONS */}
        <div className="pt-2">
          {role === "admin" ? (
            <LuminousButton
              variant="outline"
              className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
              onClick={() => console.log("Admin Delete")}
            >
              <TbTrash className="text-lg" /> Terminate Listing
            </LuminousButton>
          ) : isOwner ? (
            <LuminousButton
              variant="outline"
              className="w-full"
              to={`/dashboard/update-plant/${plant._id}`}
            >
              <TbEdit className="text-lg" /> Refine Inventory
            </LuminousButton>
          ) : (
            <div className="flex gap-3">
              <LuminousButton
                className="flex-1"
                onClick={() => console.log("Add to Cart")}
                disabled={isOutOfStock}
              >
                <TbShoppingCart className="text-lg" />
                {isOutOfStock ? "Wishlist" : "Acquire"}
              </LuminousButton>
              <Link
                to={`/plants/${plant._id}`}
                className="w-14 h-14 flex items-center justify-center bg-secondary/50 rounded-2xl border border-border/50 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
              >
                <TbEye className="text-xl" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
