import { useState, useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MdEdit,
  MdDeleteSweep,
  MdInventory,
  MdSave,
  MdWarning,
} from "react-icons/md";
import useInventory from "@/hooks/useInventory";
// import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import toast from "react-hot-toast";

const MyInventory = () => {
  // const { user } = useAuth();
  const { plants, isLoading, deletePlant, updatePlant } = useInventory();
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const container = useRef();

  // NEXT-LEVEL ANIMATION: Only stagger the first 10 rows for performance
  useGSAP(() => {
    if (!isLoading && plants.length > 0) {
      gsap.from(".row-anim", {
        opacity: 0,
        y: 15,
        stagger: {
          each: 0.03,
          from: "start",
          grid: "auto",
        },
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all", // CRITICAL: Removes GSAP styles after animation so content stays visible
      });
    }
  }, [isLoading]);

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">Delete forever?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deletePlant(id);
                toast.dismiss(t.id);
              }}
              className="bg-rose-600 text-white px-3 py-1 rounded-md text-xs font-black uppercase"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 text-xs font-bold underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { position: "top-right" },
    );
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    const { price, quantity } = e.target.elements;
    await updatePlant({
      id: selectedPlant._id,
      price: parseFloat(price.value),
      quantity: parseInt(quantity.value),
    });
    setIsSheetOpen(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Absolute Stunner Header */}
      <header className="glass-header p-6 rounded-[2rem] flex justify-between items-center mt-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-primary shadow-xl">
            <MdInventory size={28} />
          </div>
          <div>
            <h1 className="text-3xl text-heading">Nursery Vault</h1>
            <p className="text-detail">Inventory Integrity System</p>
          </div>
        </div>
        <div className="hidden md:flex gap-8 items-center pr-4">
          <div className="text-right">
            <p className="text-detail">Active Listings</p>
            <p className="text-2xl font-black text-slate-900 leading-none">
              {plants.length}
            </p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200" />
          <div className="text-right">
            <p className="text-detail">Valuation</p>
            <p className="text-2xl font-black text-primary leading-none">
              $
              {plants
                .reduce((acc, p) => acc + p.price * p.quantity, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      {/* Crystal Clear Data Grid */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="w-28 pl-8 py-5 text-detail">
                Media
              </TableHead>
              <TableHead className="text-detail">Item Details</TableHead>
              <TableHead className="text-center text-detail">
                Availability
              </TableHead>
              <TableHead className="text-center text-detail">Price</TableHead>
              <TableHead className="text-right pr-8 text-detail">
                Controls
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.map((plant) => (
              <TableRow
                key={plant._id}
                className="inventory-row row-anim group"
              >
                <TableCell className="pl-8 py-4">
                  <div className="size-16 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                    <img
                      src={plant.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={plant.name}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-800 text-lg tracking-tight leading-tight">
                      {plant.name}
                    </p>
                    <p className="text-[10px] font-black uppercase text-primary/60">
                      {plant.category}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      plant.quantity < 5
                        ? "badge-low-stock"
                        : "font-black text-slate-600 text-lg"
                    }
                  >
                    {plant.quantity}{" "}
                    <span className="text-[10px] opacity-40">U</span>
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xl font-black text-slate-900 tracking-tighter italic">
                    ${plant.price.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setSelectedPlant(plant);
                        setIsSheetOpen(true);
                      }}
                      variant="ghost"
                      className="size-10 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <MdEdit
                        size={20}
                        className="text-slate-400 group-hover:text-primary"
                      />
                    </Button>
                    <Button
                      onClick={() => handleDelete(plant._id)}
                      variant="ghost"
                      className="size-10 rounded-xl hover:bg-rose-50 transition-all"
                    >
                      <MdDeleteSweep
                        size={22}
                        className="text-slate-400 group-hover:text-rose-500"
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Slide-to-Edit Controller */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l-4 border-slate-900">
          <SheetHeader className="mt-8 mb-12">
            <SheetTitle className="text-4xl font-black tracking-tighter uppercase italic">
              Control
            </SheetTitle>
            <SheetDescription className="text-detail">
              Refining Asset: {selectedPlant?.name}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={onUpdate} className="space-y-10">
            <div className="space-y-3">
              <Label className="text-detail ml-1">Market Listing Price</Label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-300">
                  $
                </span>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={selectedPlant?.price}
                  className="h-20 rounded-2xl bg-slate-50 border-none font-black text-4xl pl-12 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-detail ml-1">Total Stock Count</Label>
              <Input
                name="quantity"
                type="number"
                defaultValue={selectedPlant?.quantity}
                className="h-20 rounded-2xl bg-slate-50 border-none font-black text-4xl px-8 focus-visible:ring-primary"
              />
            </div>
            <Button className="w-full h-20 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-primary transition-all shadow-2xl active:scale-[0.98] flex gap-3">
              <MdSave size={24} /> Commit Changes
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyInventory;
