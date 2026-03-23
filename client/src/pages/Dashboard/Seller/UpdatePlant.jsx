import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbFidgetSpinner,
  TbLeaf,
  TbCategory2,
  TbPlus,
  TbMinus,
  TbScanEye,
  TbArrowLeft,
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
import useInventory from "@/hooks/useInventory"; // Assume you have this for fetching/updating
import LoadingSpinner from "@/components/Shared/LoadingSpinner/LoadingSpinner";
import toast from "react-hot-toast";

const plantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.enum(["Indoor", "Outdoor", "Succulent", "Flowering"]),
  description: z
    .string()
    .min(20, "Detailed botanical logs required (20+ chars)"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(1, "Minimum stock is 1"),
});

const UpdatePlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef();
  const { plants, isLoading, updatePlant } = useInventory(); // Custom hook logic

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
    if (currentPlant) form.reset(currentPlant);
  }, [currentPlant, form]);

  const watched = form.watch();

  // Premium Tilt Effect for the Live Preview
  useGSAP(() => {
    const el = previewRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      gsap.to(el, {
        rotationY: x * 15,
        rotationX: -y * 15,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.6,
      });
    };
    const handleMouseLeave = () =>
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.6 });
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [watched.category]);

  const onSubmit = async (values) => {
    try {
      await updatePlant({ id, ...values });
      toast.success("Specimen recalibrated successfully");
      navigate("/dashboard/my-plants");
    } catch (err) {
      toast.error("Registry update failed");
    }
  };

  if (isLoading || !currentPlant) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all"
      >
        <TbArrowLeft size={18} /> Revert to Inventory
      </button>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-7 space-y-8 bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label-fancy">
                      <MdHistoryEdu className="text-primary" /> Specimen Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="input-field text-lg font-bold"
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
                    <FormLabel className="form-label-fancy">
                      <TbCategory2 className="text-primary" /> Genus
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="input-field font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                          (c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="py-3 font-bold"
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

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label-fancy">
                      <MdAttachMoney className="text-primary" /> Market Value
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="input-field text-xl font-black pl-8"
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
                    <FormLabel className="form-label-fancy">
                      Stock Units
                    </FormLabel>
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-10 rounded-xl bg-white shadow-sm"
                        onClick={() =>
                          form.setValue(
                            "quantity",
                            Math.max(1, field.value - 1),
                          )
                        }
                      >
                        <TbMinus />
                      </Button>
                      <span className="flex-1 text-center font-black text-xl">
                        {field.value}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="size-10 rounded-xl bg-white shadow-sm"
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
                  <FormLabel className="form-label-fancy">
                    <MdOutlineDescription className="text-primary" /> Botanical
                    Logs
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      className="input-field py-4 resize-none font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl shadow-primary/10"
            >
              Update Specimen Data
            </Button>
          </div>

          {/* RIGHT: LIVE PROJECTION */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-32">
            <p className="form-label-fancy text-primary mb-6">
              <TbScanEye size={20} /> Real-Time Projection
            </p>

            <div
              ref={previewRef}
              className={cn(
                "p-10 rounded-[4rem] min-h-[500px] flex flex-col justify-between shadow-2xl transition-all duration-1000 relative overflow-hidden",
                watched.category === "Flowering"
                  ? "bg-rose-500"
                  : watched.category === "Succulent"
                    ? "bg-amber-500"
                    : watched.category === "Outdoor"
                      ? "bg-slate-800"
                      : "bg-emerald-600",
              )}
            >
              <div className="absolute top-0 right-0 size-80 bg-white/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl mb-8">
                <img
                  src={currentPlant.image}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
              </div>

              <div className="relative z-10 space-y-2">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
                  {watched.category}
                </span>
                <h3 className="text-4xl font-black text-white tracking-tighter italic">
                  {watched.name || "Untitled"}
                </h3>
              </div>

              <div className="relative z-10 flex justify-between items-end mt-8">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase">
                    Value Index
                  </p>
                  <p className="text-5xl font-black text-white tracking-tighter italic">
                    ${watched.price}
                    <span className="text-xl opacity-40">.00</span>
                  </p>
                </div>
                <div className="bg-black/20 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 text-center">
                  <p className="text-[9px] font-black text-white/50 uppercase">
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
