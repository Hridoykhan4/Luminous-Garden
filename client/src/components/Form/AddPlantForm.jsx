import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  TbFidgetSpinner,
  TbLeaf,
  TbCategory2,
  TbPlus,
  TbMinus,
  TbScanEye,
} from "react-icons/tb";
import {
  MdCloudUpload,
  MdClose,
  MdAttachMoney,
  MdOutlineDescription,
  MdHistoryEdu,
  MdErrorOutline,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

const plantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.enum(["Indoor", "Outdoor", "Succulent", "Flowering"]),
  description: z
    .string()
    .min(20, "Detailed botanical logs required (20+ chars)"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(1, "Minimum stock is 1"),
});

const AddPlantForm = ({ onSubmit, uploadImage, setUploadImage, loading }) => {
  const previewRef = useRef();
  const form = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 1,
      category: "Indoor",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watched = form.watch();

  // GSAP: Premium Tilt Effect on Preview Card
  useGSAP(() => {
    const el = previewRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      gsap.to(el, {
        rotationY: x * 10,
        rotationX: -y * 10,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.6,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.6 });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [watched.category]);

  const updateQuantity = (val) => {
    const current = form.getValues("quantity");
    form.setValue("quantity", Math.max(1, current + val), {
      shouldValidate: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* LEFT: THE DATA INPUT FORGE */}
          <div className="lg:col-span-7 space-y-10">
            <header className="space-y-2">
              <div className="flex items-center gap-3 text-emerald-600">
                <TbLeaf size={32} className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  Vault Entry
                </span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                New Specimen.
              </h1>
              <p className="text-slate-500 font-medium max-w-md">
                Deploy your assets to the global nursery network with botanical
                precision.
              </p>
            </header>

            <div className="glass-card rounded-[3rem] p-8 md:p-12 space-y-8 border-white/60">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label-fancy">
                      <MdHistoryEdu className="text-emerald-500" size={16} />{" "}
                      Botanical Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Philodendron Pink Princess"
                        className="input-field text-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-rose-500 uppercase italic" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label-fancy">
                        <TbCategory2 className="text-emerald-500" size={16} />{" "}
                        Genus Classification
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="input-field font-bold">
                            <SelectValue placeholder="Classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                          {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                            (c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                className="py-3 font-bold text-slate-600 focus:bg-emerald-50 focus:text-emerald-700"
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

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label-fancy">
                        <MdAttachMoney className="text-emerald-500" size={16} />{" "}
                        Listing Price
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className="input-field pl-10 text-xl font-black"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-500 uppercase italic" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label-fancy">
                      Inventory Units
                    </FormLabel>
                    <div className="flex items-center gap-6 bg-slate-100/50 p-2 rounded-3xl w-fit border border-slate-200 shadow-inner">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(-1)}
                        className="size-12 rounded-2xl bg-white shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <TbMinus size={20} />
                      </Button>
                      <span className="text-3xl font-black text-slate-800 w-12 text-center">
                        {field.value}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(1)}
                        className="size-12 rounded-2xl bg-white shadow-sm hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <TbPlus size={20} />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label-fancy">
                      <MdOutlineDescription
                        className="text-emerald-500"
                        size={16}
                      />{" "}
                      Care Instructions & Specs
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain light levels, soil pH, and moisture needs..."
                        className="min-h-32 input-field py-4 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-rose-500 uppercase italic" />
                  </FormItem>
                )}
              />

              <Button
                disabled={loading || !uploadImage.image}
                type="submit"
                className="w-full h-20 rounded-3xl bg-slate-900 text-white text-lg font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <TbFidgetSpinner className="animate-spin text-3xl" />
                ) : (
                  "Deploy to Network"
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT: THE LIVE LAB PREVIEW */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-10 h-fit">
            <div className="space-y-6">
              <p className="form-label-fancy text-emerald-600">
                <TbScanEye size={18} /> Real-Time Projection
              </p>

              {/* IMAGE DROPZONE */}
              <div className="relative group">
                {!uploadImage.url ? (
                  <label className="flex flex-col items-center justify-center h-80 border-4 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-500 overflow-hidden">
                    <MdCloudUpload
                      size={60}
                      className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-y-3 transition-all duration-700"
                    />
                    <span className="mt-4 font-black text-slate-400 group-hover:text-emerald-700 uppercase tracking-tighter">
                      Capture Visuals
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file)
                          setUploadImage({
                            image: file,
                            url: URL.createObjectURL(file),
                          });
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src={uploadImage.url}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <button
                      onClick={() => setUploadImage({ image: null, url: null })}
                      className="absolute top-6 right-6 size-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:rotate-90 transition-all shadow-xl"
                    >
                      <MdClose size={24} />
                    </button>
                  </div>
                )}
                {!uploadImage.image && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
                    <MdErrorOutline /> Image Required for Registry
                  </div>
                )}
              </div>

              {/* DYNAMIC GSAP CARD */}
              <div
                ref={previewRef}
                className={cn(
                  "p-10 rounded-[3.5rem] min-h-100 flex flex-col justify-between shadow-2xl transition-colors duration-1000 relative overflow-hidden",
                  watched.category === "Flowering"
                    ? "bg-rose-500"
                    : watched.category === "Succulent"
                      ? "bg-amber-500"
                      : watched.category === "Outdoor"
                        ? "bg-slate-800"
                        : "bg-emerald-600",
                )}
              >
                <div className="absolute top-0 right-0 size-64 bg-white/10 blur-[100px] rounded-full" />

                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                      {watched.category}
                    </span>
                    <TbLeaf
                      className="text-white/30 animate-spin-slow"
                      size={40}
                    />
                  </div>
                  <h3 className="text-4xl font-black text-white leading-none tracking-tighter truncate">
                    {watched.name || "Untitled Specimen"}
                  </h3>
                  <p className="text-white/60 text-sm italic font-medium line-clamp-3">
                    "{watched.description || "Synthesizing botanical logs..."}"
                  </p>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                      Mkt. Value
                    </p>
                    <div className="text-6xl font-black text-white tracking-tighter italic">
                      ${watched.price}
                      <span className="text-2xl opacity-40">.00</span>
                    </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 text-center">
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPlantForm;
