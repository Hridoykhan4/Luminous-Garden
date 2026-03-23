import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbPlus,
  TbMinus,
  TbShoppingCart,
  TbEdit,
  TbTrash,
  TbCheck,
  TbTruckReturn,
} from "react-icons/tb";
import useAuth from "@/hooks/useAuth";
import useUserRole from "@/hooks/useUserRole";
import LuminousButton from "@/components/Shared/LuminousButton/LuminousButton";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import useSinglePlant from "@/hooks/useSinglePlant";


const PlantDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const {role} = useUserRole();
  const { data: plant = {}, isLoading } = useSinglePlant(id);

  const [quantity, setQuantity] = useState(1);
  const imageContainerRef = useRef(null);
  const zoomRef = useRef(null);

  const isOwner = user?.email === plant?.seller?.email;
  const isOutOfStock = plant?.quantity === 0;

  // --- 1. GSAP IMAGE ZOOM LOGIC ---
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return; // Disable on mobile for better UX
    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    gsap.to(zoomRef.current, {
      display: "block",
      opacity: 1,
      backgroundPosition: `${x}% ${y}%`,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(zoomRef.current, { opacity: 0, display: "none", duration: 0.3 });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!plant)
    return <div className="text-center py-20">Specimen not found.</div>;

  return (
    <main className="container-page py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* LEFT: IMAGE SECTION WITH ADVANCED ZOOM */}
        <div
          ref={imageContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative group cursor-zoom-in rounded-[3rem] overflow-hidden bg-secondary/10 border border-border/50 aspect-square"
        >
          <img
            src={plant.image}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* THE ZOOM OVERLAY (Desktop Only) */}
          <div
            ref={zoomRef}
            className="absolute inset-0 z-30 pointer-events-none hidden bg-no-repeat"
            style={{
              backgroundImage: `url(${plant.image})`,
              backgroundSize: "250%", // 2.5x Zoom
            }}
          />

          <div className="absolute top-8 left-8 flex gap-3">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">
              {plant.category}
            </span>
            {isOutOfStock && (
              <span className="px-4 py-2 bg-destructive text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: CONTENT & TRANSACTION ENGINE */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic title-gradient tracking-tighter leading-none">
              {plant.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                <img
                  src={plant.seller.image}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cataloged by {isOwner ? "You" : plant.seller.name}
                </span>
              </div>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                {plant.quantity} Units Available
              </span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed font-medium italic">
            {plant.description}
          </p>

          <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-border/40 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  Price per specimen
                </p>
                <h2 className="text-4xl font-black text-foreground">
                  ${plant.price}
                </h2>
              </div>

              {/* QUANTITY CONTROL: Only for non-owners/non-admins */}
              {!isOwner && role !== "admin" && (
                <div className="flex items-center bg-background rounded-2xl p-2 border border-border/50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => q - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary transition-all disabled:opacity-30"
                  >
                    <TbMinus />
                  </button>
                  <span className="w-12 text-center font-black text-lg">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= plant.quantity}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary transition-all disabled:opacity-30"
                  >
                    <TbPlus />
                  </button>
                </div>
              )}
            </div>

            {/* DYNAMIC CTA ENGINE */}
            <div className="flex flex-col gap-4">
              {role === "admin" ? (
                <LuminousButton
                  variant="outline"
                  className="w-full border-destructive/20 text-destructive hover:bg-destructive"
                >
                  <TbTrash className="text-xl" /> Permanent Removal
                </LuminousButton>
              ) : isOwner ? (
                <LuminousButton
                  to={`/dashboard/update/${plant._id}`}
                  className="w-full"
                >
                  <TbEdit className="text-xl" /> Refine Specimen Data
                </LuminousButton>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <LuminousButton
                    disabled={isOutOfStock}
                    className="col-span-3 h-16"
                    onClick={() => console.log("Order Modal Trigger")}
                  >
                    <TbShoppingCart className="text-xl" />
                    {isOutOfStock
                      ? "Out of Stock"
                      : `Acquire ${quantity} Specimen${quantity > 1 ? "s" : ""}`}
                  </LuminousButton>
                  <button className="col-span-1 flex items-center justify-center rounded-2xl bg-white border border-border hover:text-primary transition-all">
                    <TbTruckReturn className="text-2xl" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-3xl bg-primary/5 border border-primary/10">
              <TbCheck className="text-primary text-xl" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                Identity <br /> Verified
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-3xl bg-primary/5 border border-primary/10">
              <TbCheck className="text-primary text-xl" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                Eco-Safe <br /> Packaging
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlantDetails;
