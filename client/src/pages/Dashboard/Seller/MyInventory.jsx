import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MdEdit,
  MdDeleteSweep,
  MdInventory,
  MdSave,
  MdTrendingUp,
} from "react-icons/md";
import { TbListSearch, TbX } from "react-icons/tb";
import useInventory from "@/hooks/useInventory";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import toast from "react-hot-toast";

const MyInventory = () => {
  const { plants, isLoading, deletePlant, updatePlant } = useInventory();
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const container = useRef();

  // FIX: Using "will-change" to prevent the "blur" flickering on large lists
  useGSAP(() => {
    if (!isLoading && plants.length > 0) {
      gsap.from(".asset-card", {
        opacity: 0,
        x: -20,
        stagger: 0.05,
        duration: 0.5,
        ease: "expo.out",
        clearProps: "all", // Prevents GSAP from leaving 'transform' which causes blur
      });
    }
  }, [isLoading, plants]);

  const handleDelete = (id) => {
    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-slate-900 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex p-4 items-center gap-4`}
        >
          <div className="flex-1">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">
              Confirm Deletion
            </p>
            <p className="text-[9px] text-slate-400 uppercase italic">
              This action is irreversible.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deletePlant(id);
                toast.dismiss(t.id);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors"
            >
              Erase
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors"
            >
              Abort
            </button>
          </div>
        </div>
      ),
      { position: "bottom-center" },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div
      ref={container}
      className="max-w-7xl mx-auto space-y-8 pb-40 px-4 md:px-8"
    >
      {/* --- STATS HUD --- */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <StatCard
          label="Live Inventory"
          value={plants.length}
          icon={MdInventory}
          color="text-slate-900"
        />
        <StatCard
          label="Vault Value"
          value={`৳${plants.reduce((acc, p) => acc + p.price * p.quantity, 0).toLocaleString()}`}
          icon={MdTrendingUp}
          color="text-emerald-600"
        />
        <div className="hidden lg:flex flex-col justify-center items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
            Global Status
          </span>
          <span className="text-xs font-bold text-emerald-500 uppercase mt-1">
            ● All Systems Nominal
          </span>
        </div>
      </header>

      {/* --- INVENTORY CORE --- */}
      <div className="grid grid-cols-1 gap-4">
        {plants.map((plant) => (
          <div
            key={plant._id}
            className="asset-card group bg-white border border-slate-100 rounded-4xl p-4 lg:p-5 flex flex-col lg:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-emerald-500/20 transition-all duration-500 will-change-transform"
          >
            {/* Visual with Glow */}
            <div className="relative size-24 lg:size-20 shrink-0">
              <img
                src={plant.image}
                className="w-full h-full object-cover rounded-2xl"
                alt=""
              />
              <div className="absolute inset-0 rounded-2xl shadow-inner ring-1 ring-black/5" />
              <div className="absolute -top-2 -left-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg">
                {plant.category}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">
                {plant.name}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center justify-center lg:justify-start gap-2">
                <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                UID: {plant._id.slice(-8)}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex gap-10 lg:gap-14 items-center bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                  Stock
                </p>
                <p
                  className={
                    plant.quantity < 5
                      ? "text-rose-600 font-black animate-bounce"
                      : "font-black text-slate-700"
                  }
                >
                  {plant.quantity}{" "}
                  <span className="text-[10px] opacity-50">Units</span>
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                  Valuation
                </p>
                <p className="font-black text-slate-900 text-xl italic">
                  ৳{plant.price}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedPlant(plant);
                  setIsSheetOpen(true);
                }}
                className="size-14 rounded-2xl bg-slate-900 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <MdEdit size={22} />
              </Button>
              <Button
                onClick={() => handleDelete(plant._id)}
                className="size-14 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
              >
                <MdDeleteSweep size={24} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* --- THE "ZERO-CHAOS" UPDATE SHEET --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 bg-slate-50 border-none shadow-2xl flex flex-col outline-none">
          {/* 1. FIXED HEADER */}
          <div className="bg-slate-900 text-white p-8 pt-12 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="size-12 rounded-2xl overflow-hidden ring-2 ring-emerald-500/20">
                <img
                  src={selectedPlant?.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div>
                <SheetTitle className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none">
                  Asset Edit
                </SheetTitle>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1">
                  {selectedPlant?.name}
                </p>
              </div>
            </div>
            <SheetClose className="relative z-50 size-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-rose-500 transition-all text-white pointer-events-auto border-none outline-none">
              <TbX size={20} />
            </SheetClose>
          </div>

          {/* 2. SCROLLABLE FORM BODY */}
          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
            <form
              id="update-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const { price, quantity } = e.target.elements;
                await updatePlant({
                  id: selectedPlant._id,
                  price: parseFloat(price.value),
                  quantity: parseInt(quantity.value),
                });
                setIsSheetOpen(false);
              }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Market Price (Unit)
                </Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">
                    ৳
                  </div>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={selectedPlant?.price}
                    className="h-24 rounded-4xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 font-black text-5xl pl-14 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Stock Capacity
                </Label>
                <div className="relative">
                  <Input
                    name="quantity"
                    type="number"
                    defaultValue={selectedPlant?.quantity}
                    className="h-24 rounded-4xl bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 font-black text-5xl px-8 transition-all shadow-sm"
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black uppercase tracking-widest text-xs">
                    Units
                  </span>
                </div>
              </div>

              {/* Technical Tip */}
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-4">
                <TbListSearch className="text-emerald-600 shrink-0" size={24} />
                <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase italic">
                  Changes sync immediately with the public ledger. Verify stock
                  levels to prevent order cancellations.
                </p>
              </div>
            </form>
          </div>

          {/* 3. MOBILE-OPTIMIZED STICKY FOOTER */}
          {/* This uses 'mb-safe' logic or a large margin to clear bottom navbars */}
          <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-24 lg:pb-6 z-50000000">
            <Button
              type="submit"
              form="update-form"
              className="w-full h-20 rounded-4xl bg-slate-900 text-white font-black uppercase tracking-[0.4em] hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-900/20 active:scale-95 flex gap-4"
            >
              <MdSave size={24} /> Commit Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-emerald-500/30 hover:shadow-xl transition-all duration-500">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`text-4xl font-black italic tracking-tighter ${color}`}>
        {value}
      </p>
    </div>
    <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all duration-500">
      <Icon size={32} />
    </div>
  </div>
);

export default MyInventory;
