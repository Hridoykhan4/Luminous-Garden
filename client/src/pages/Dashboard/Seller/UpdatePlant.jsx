import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbCategory2,
  TbPlus,
  TbMinus,
  TbArrowLeft,
  TbActivity,
  TbLeaf,
} from "react-icons/tb";
import { MdHistoryEdu } from "react-icons/md";
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
import useSinglePlant from "@/hooks/useSinglePlant";

const CATEGORIES = ["Indoor", "Outdoor", "Succulent", "Flowering"];

const plantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Please select a genus"),
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
  const { updatePlant } = useInventory();
  const { data: currentPlant, isLoading } = useSinglePlant(id);

  const form = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      category: "", // Keep empty initially
      description: "",
      price: 0,
      quantity: 1,
    },
  });

  // THE SYNC ENGINE: Normalizes data and resets form strictly
  useEffect(() => {
    if (currentPlant && !isLoading) {
      // 1. Normalize Category (Ensures "indoor" becomes "Indoor" to match Select options)
      const rawCat = currentPlant.category || "Indoor";
      const normalizedCat =
        CATEGORIES.find((c) => c.toLowerCase() === rawCat.toLowerCase()) ||
        "Indoor";

      // 2. Atomic Reset
      form.reset({
        name: currentPlant.name || "",
        category: normalizedCat,
        description: currentPlant.description || "",
        price: currentPlant.price || 0,
        quantity: currentPlant.quantity || 0,
      });
    }
  }, [currentPlant, isLoading, form]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const watched = form.watch();

  // 3D Magnetic Effect (Using GSAP QuickTo for performance)
  useGSAP(() => {
    const el = previewRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "rotationY", {
      duration: 0.5,
      ease: "power3",
    });
    const yTo = gsap.quickTo(el, "rotationX", {
      duration: 0.5,
      ease: "power3",
    });

    const move = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      xTo(((e.clientX - left) / width - 0.5) * 20);
      yTo(-((e.clientY - top) / height - 0.5) * 20);
    };
    const leave = () => {
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.3)",
      });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  const onSubmit = async (values) => {
    const loadingToast = toast.loading("Syncing with Registry...");
    try {
      await updatePlant({ id, ...currentPlant, ...values });
      toast.success("Specimen Updated", { id: loadingToast });
      navigate("/dashboard/my-plants");
    } catch (err) {
      console.log(err);
      toast.error("Update Failed", { id: loadingToast });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 pt-10 font-sans">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
        >
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <TbArrowLeft size={18} />
          </div>
          Back to Vault
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100">
          <TbActivity className="animate-pulse" /> Live Sync Active
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* Input Panel */}
          <div className="lg:col-span-7 space-y-8 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              Modify Specimen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      <MdHistoryEdu className="text-emerald-500" /> Identity
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-16 rounded-2xl bg-slate-50 border-none font-bold text-lg px-6"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                      <TbCategory2 className="text-emerald-500" /> Genus
                    </FormLabel>
                    {/* The KEY trick: forces Select to re-render when category value is set */}
                    <Select
                      key={field.value}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-bold px-6">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl font-bold">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="py-3">
                            {c}
                          </SelectItem>
                        ))}
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
                    <FormLabel className="text-[10px] font-black text-slate-500 mb-3 tracking-widest uppercase">
                      Market Value (৳)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-16 rounded-2xl bg-slate-50 border-none font-black text-2xl px-6"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-slate-500 mb-3 tracking-widest uppercase">
                      In Stock
                    </FormLabel>
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl h-16 border border-slate-100">
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-12 rounded-xl bg-white shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                        onClick={() =>
                          form.setValue(
                            "quantity",
                            Math.max(0, field.value - 1),
                            { shouldDirty: true },
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
                          form.setValue("quantity", field.value + 1, {
                            shouldDirty: true,
                          })
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
                  <FormLabel className="text-[10px] font-black text-slate-500 mb-3 tracking-widest uppercase">
                    Botanical Summary
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      className="rounded-4xl bg-slate-50 border-none p-6 font-medium resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              className="w-full h-20 rounded-4xl bg-slate-900 text-white font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-30"
            >
              Authorize Sync
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-10">
            <div
              ref={previewRef}
              className={cn(
                "p-8 rounded-[4rem] flex flex-col justify-between shadow-2xl transition-colors duration-1000 relative overflow-hidden min-h-150",
                watched.category === "Flowering"
                  ? "bg-rose-500"
                  : watched.category === "Succulent"
                    ? "bg-amber-500"
                    : watched.category === "Outdoor"
                      ? "bg-slate-800"
                      : "bg-emerald-600",
              )}
            >
              <div className="absolute top-0 right-0 size-80 bg-white/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl mb-8">
                <img
                  src={
                    currentPlant?.image ||
                    "https://images.unsplash.com/photo-1501004318641-729e8e22bd04?auto=format&fit=crop"
                  }
                  className="w-full h-full object-cover"
                  alt="preview"
                />
              </div>
              <div className="relative z-10 space-y-3 text-white">
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-black uppercase tracking-widest border border-white/20">
                  {watched.category || "Unclassified"}
                </span>
                <h3 className="text-4xl font-black tracking-tighter italic leading-none truncate uppercase">
                  {watched.name || "Pending..."}
                </h3>
                <p className="text-white/70 text-xs font-medium line-clamp-3 italic leading-relaxed">
                  {watched.description || "Awaiting logs..."}
                </p>
              </div>
              <div className="relative z-10 flex justify-between items-end mt-12 border-t border-white/10 pt-8 text-white">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase">
                    Valuation
                  </p>
                  <p className="text-5xl font-black tracking-tighter italic">
                    ৳{watched.price || "0"}
                    <span className="text-xl opacity-30">.00</span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border border-white/10 text-center">
                  <p className="text-[9px] font-black text-white/50 uppercase mb-1">
                    Stock
                  </p>
                  <p className="text-3xl font-black leading-none">
                    {watched.quantity || "0"}
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
