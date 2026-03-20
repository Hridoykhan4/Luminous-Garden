import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TbFidgetSpinner,
  TbLeaf,
  TbCategory2,
  TbPlus,
  TbMinus,
} from "react-icons/tb";
import {
  MdCloudUpload,
  MdClose,
  MdAttachMoney,
  MdOutlineDescription,
  MdHistoryEdu,
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
  name: z.string().min(3, "Name must be 3+ characters"),
  category: z.enum(["Indoor", "Outdoor", "Succulent", "Flowering"]),
  description: z
    .string()
    .min(20, "Provide a detailed botanical description (20+ chars)"),
  price: z.coerce.number().positive("Price must be > 0"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

const AddPlantForm = ({ onSubmit, uploadImage, setUploadImage, loading }) => {
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

  const watched = form.watch();

  // Helper to sync quantity manually for the custom stepper
  const updateQuantity = (val) => {
    const current = form.getValues("quantity");
    const next = Math.max(1, current + val);
    form.setValue("quantity", next);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* --- LEFT COLUMN: THE DATA FORGE --- */}
          <div className="lg:col-span-7 space-y-8 bg-white/50 backdrop-blur-md border border-emerald-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
                <TbLeaf size={28} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-neutral-800 tracking-tight">
                  Plant Registry
                </h2>
                <p className="text-neutral-500 font-medium">
                  Document your specimen for the global garden.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Plant Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                      <MdHistoryEdu /> Specimen Nomenclature
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Variegated Monstera Adansonii"
                        className="h-14 rounded-2xl border-2 focus-visible:ring-emerald-500 bg-white/80 transition-all text-lg font-semibold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selector */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                        <TbCategory2 /> Classification
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl border-2 bg-white/80 font-semibold">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-2 shadow-xl bg-white">
                          {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                            (c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                className="focus:bg-emerald-50 font-medium py-3 cursor-pointer"
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

                {/* Price Input */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                        <MdAttachMoney /> Market Valuation
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                            $
                          </span>
                          <Input
                            type="number"
                            className="h-14 pl-10 rounded-2xl border-2 bg-white/80 font-bold text-lg"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity Stepper (The "MF" Fix) */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-700">
                      Stock Availability
                    </FormLabel>
                    <div className="flex items-center gap-4 bg-emerald-50/50 p-2 rounded-2xl border-2 border-emerald-100 w-fit">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(-1)}
                        className="h-10 w-10 rounded-xl hover:bg-white hover:text-emerald-600 transition-all shadow-sm"
                      >
                        <TbMinus strokeWidth={3} />
                      </Button>
                      <FormControl>
                        <input
                          className="w-12 text-center bg-transparent font-black text-xl text-emerald-900 outline-none"
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(1)}
                        className="h-10 w-10 rounded-xl hover:bg-white hover:text-emerald-600 transition-all shadow-sm"
                      >
                        <TbPlus strokeWidth={3} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                      <MdOutlineDescription /> Botanical Log
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe sun requirements, soil type, and watering cycle..."
                        className="min-h-37.5 rounded-2xl border-2 bg-white/80 focus-visible:ring-emerald-500 p-4 font-medium resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl text-xl font-black bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 text-white transition-all shadow-xl shadow-emerald-200"
                disabled={loading}
              >
                {loading ? (
                  <TbFidgetSpinner className="animate-spin text-3xl" />
                ) : (
                  "Registry Specimen"
                )}
              </Button>
            </div>
          </div>

          {/* --- RIGHT COLUMN: THE LIVE LAB --- */}
          <div className="lg:col-span-5 space-y-8">
            {/* Visual Identity Upload */}
            <div className="bg-white border-2 border-emerald-50 rounded-[2.5rem] p-8 shadow-xl">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-6">
                Visual Identity
              </p>
              {!uploadImage.url ? (
                <label className="flex flex-col items-center justify-center h-80 border-4 border-dashed border-emerald-100 rounded-4xl cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MdCloudUpload
                    size={56}
                    className="text-emerald-300 group-hover:text-emerald-500 group-hover:-translate-y-2 transition-all duration-500"
                  />
                  <span className="mt-4 font-bold text-emerald-700">
                    Drop your High-Res PNG
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 uppercase tracking-tighter">
                    Max Size: 5MB
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
                <div className="relative h-80 rounded-4xl overflow-hidden shadow-2xl group border-4 border-white">
                  <img
                    src={uploadImage.url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                  <button
                    type="button"
                    onClick={() => setUploadImage({ image: null, url: null })}
                    className="absolute top-6 right-6 p-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-600 transition-all scale-0 group-hover:scale-100 shadow-xl"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphic Live Preview */}
            <div
              className={cn(
                "relative rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 min-h-70 flex flex-col justify-between shadow-2xl shadow-emerald-900/20",
                watched.category === "Flowering"
                  ? "bg-linear-to-br from-pink-500 to-rose-600"
                  : watched.category === "Succulent"
                    ? "bg-linear-to-br from-amber-400 to-orange-500"
                    : "bg-linear-to-br from-emerald-600 to-teal-800",
              )}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/30">
                    {watched.category || "Classification"}
                  </span>
                  <TbLeaf
                    className="text-white/40 animate-spin-slow"
                    size={32}
                  />
                </div>
                <h3 className="text-3xl font-black text-white leading-none mb-2 drop-shadow-md truncate">
                  {watched.name || "Specimen Name"}
                </h3>
                <p className="text-white/70 text-sm font-medium line-clamp-2 max-w-[80%] italic">
                  "{watched.description || "Waiting for botanical logs..."}"
                </p>
              </div>

              <div className="relative z-10 flex justify-between items-end mt-12">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">
                    Market Value
                  </span>
                  <div className="text-5xl font-black text-white tracking-tighter italic">
                    ${watched.price || "0"}
                    <span className="text-xl opacity-60">.00</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-black text-emerald-100 uppercase leading-none mb-1">
                    Stock
                  </span>
                  <span className="text-2xl font-black text-white leading-none">
                    {watched.quantity}
                  </span>
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
