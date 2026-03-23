import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbLeaf,
  TbCategory2,
  TbPlus,
  TbMinus,
  TbScanEye,
  TbArrowLeft,
  TbActivity,
} from "react-icons/tb";
import {
  MdAttachMoney,
  MdOutlineDescription,
  MdHistoryEdu,
} from "react-icons/md";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useInventory from "@/hooks/useInventory";
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import toast from "react-hot-toast";

// Schema matching your JSON structure
const plantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string(),
  description: z
    .string()
    .min(20, "Detailed botanical logs required (20+ chars)"),
  price: z.coerce.number().min(1, "Value must be positive"),
  quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

const UpdatePlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef();
  const { plants, isLoading, updatePlant } = useInventory();

  const currentPlant = plants?.find((p) => p._id === id);

  const form = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      category: "Indoor",
      description: "",
      price: 0,
      quantity: 1,
    },
  });

  // Sync data when loaded
  useEffect(() => {
    if (currentPlant) {
      form.reset({
        name: currentPlant.name,
        category: currentPlant.category,
        description: currentPlant.description,
        price: currentPlant.price,
        quantity: currentPlant.quantity,
      });
    }
  }, [currentPlant, form]);

  const watched = form.watch();

  // GSAP 3D Tilt Effect
  useGSAP(() => {
    const el = previewRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      gsap.to(el, {
        rotationY: x * 20,
        rotationX: -y * 20,
        transformPerspective: 1200,
        ease: "power2.out",
        duration: 0.4,
      });
    };
    const handleMouseLeave = () =>
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.8 });
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [watched.category]);

  const onSubmit = async (values) => {
    const loadingToast = toast.loading("Recalibrating registry...");
    try {
      // Formats the data exactly like your JSON structure
      const payload = {
        _id: id,
        ...values,
        image: currentPlant.image, // Keep existing image
        seller: currentPlant.seller, // Preserve existing seller object
        updatedAt: new Date().toISOString(),
      };

      console.log("SENDING TO API:", payload);

      await updatePlant(payload);

      toast.success("Specimen recalibrated successfully", { id: loadingToast });
      navigate("/dashboard/my-inventory");
    } catch (err) {
      toast.error("Registry update failed", { id: loadingToast });
    }
  };

  if (isLoading || !currentPlant) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* NAVIGATION HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
        >
          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <TbArrowLeft size={16} />
          </div>
          Back to Vault
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <TbActivity className="animate-pulse" /> Live Editing Mode
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT: DATA ENTRY */}
          <div className="lg:col-span-7 space-y-8 bg-white p-6 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                Edit Specimen
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Registry ID: {id}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      <MdHistoryEdu className="text-emerald-500" size={18} />{" "}
                      Identification
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-16 rounded-2xl bg-slate-50 border-none font-bold text-lg px-6 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      <TbCategory2 className="text-emerald-500" size={18} />{" "}
                      Genus
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-bold px-6">
                          <SelectValue placeholder="Select Genus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl font-bold">
                        {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                          (c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="py-3 capitalize"
                            >
                              {c}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      <MdAttachMoney className="text-emerald-500" size={18} />{" "}
                      Unit Valuation (৳)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-16 rounded-2xl bg-slate-50 border-none font-black text-2xl px-6"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      Stock Units
                    </FormLabel>
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl h-16">
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-12 rounded-xl bg-white shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                        onClick={() =>
                          form.setValue(
                            "quantity",
                            Math.max(0, field.value - 1),
                          )
                        }
                      >
                        <TbMinus />
                      </Button>
                      <span className="font-black text-2xl">{field.value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-12 rounded-xl bg-white shadow-sm hover:bg-emerald-500 hover:text-white transition-all"
                        onClick={() =>
                          form.setValue("quantity", field.value + 1)
                        }
                      >
                        <TbPlus />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                    <MdOutlineDescription
                      className="text-emerald-500"
                      size={18}
                    />{" "}
                    Botanical Logs
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      className="rounded-[2rem] bg-slate-50 border-none p-6 font-medium resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.4em] hover:bg-emerald-600 hover:scale-[1.01] transition-all shadow-xl shadow-emerald-900/10"
            >
              Commit Changes
            </Button>
          </div>

          {/* RIGHT: LIVE PROJECTION */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-10">
            <div
              ref={previewRef}
              className={cn(
                "p-8 rounded-[4rem] flex flex-col justify-between shadow-2xl transition-all duration-700 relative overflow-hidden will-change-transform",
                watched.category === "Flowering"
                  ? "bg-rose-500"
                  : watched.category === "Succulent"
                    ? "bg-amber-500"
                    : watched.category === "Outdoor"
                      ? "bg-slate-800"
                      : "bg-emerald-600",
              )}
            >
              <div className="absolute top-0 right-0 size-64 bg-white/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />

              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl mb-8 group">
                <img
                  src={currentPlant.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="preview"
                />
              </div>

              <div className="relative z-10 space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                  {watched.category || "Unclassified"}
                </span>
                <h3 className="text-4xl font-black text-white tracking-tighter italic leading-none truncate uppercase">
                  {watched.name || "Specimen Null"}
                </h3>
                <p className="text-white/60 text-xs font-medium line-clamp-2 italic pr-10 leading-relaxed">
                  "{watched.description || "No logs available..."}"
                </p>
              </div>

              <div className="relative z-10 flex justify-between items-end mt-12 border-t border-white/10 pt-8">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    Unit Value
                  </p>
                  <p className="text-5xl font-black text-white tracking-tighter italic">
                    ৳{watched.price}
                    <span className="text-xl opacity-30">.00</span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 text-center">
                  <p className="text-[9px] font-black text-white/50 uppercase mb-1">
                    Stock
                  </p>
                  <p className="text-3xl font-black text-white leading-none">
                    {watched.quantity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdatePlant;
