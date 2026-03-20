import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TbFidgetSpinner, TbLeaf } from "react-icons/tb";
import {
  MdCloudUpload,
  MdClose,
  MdAttachMoney,
  MdNumbers,
} from "react-icons/md";
import { HiOutlineIdentification } from "react-icons/hi2";
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

const plantSchema = z.object({
  name: z.string().min(3, "Name must be 3+ characters"),
  category: z.enum(["Indoor", "Outdoor", "Succulent", "Flowering"]),
  description: z.string().min(20, "Description must be 20+ characters"),
  price: z.coerce.number().positive("Price must be > 0"),
  quantity: z.coerce.number().int().min(1, "Quantity must be 1+"),
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

  // Watch values for the Live Preview
  const watchedValues = form.watch();

  return (
    <div className="max-w-6xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* LEFT: Input Fields */}
          <div className="lg:col-span-7 bg-white border rounded-[2rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <TbLeaf size={24} />
              </div>
              <h2 className="text-2xl font-bold">Plant Specifications</h2>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-neutral-500">
                    Official Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Midnight Monstera"
                      className="h-12 rounded-xl border-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-neutral-500">
                      Classification
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
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
                    <FormLabel className="text-xs font-bold uppercase text-neutral-500">
                      Price (USD)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MdAttachMoney className="absolute left-3 top-3.5 text-neutral-400" />
                        <Input
                          type="number"
                          className="h-12 pl-8 rounded-xl border-2"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-neutral-500">
                    Botanical Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the care requirements..."
                      className="min-h-32 rounded-xl border-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-200"
              disabled={loading}
            >
              {loading ? (
                <TbFidgetSpinner className="animate-spin text-2xl" />
              ) : (
                "Registry Specimen"
              )}
            </Button>
          </div>

          {/* RIGHT: Live Preview & Image Upload */}
          <div className="lg:col-span-5 space-y-6">
            {/* Image Upload Area */}
            <div className="bg-white border rounded-[2rem] p-6 shadow-sm">
              <FormLabel className="text-xs font-bold uppercase text-neutral-500 mb-4 block">
                Visual Identity
              </FormLabel>
              {!uploadImage.url ? (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-emerald-200 rounded-3xl cursor-pointer hover:bg-emerald-50 transition-all group">
                  <MdCloudUpload
                    size={40}
                    className="text-emerald-400 group-hover:scale-110 transition-transform"
                  />
                  <span className="mt-2 font-medium text-emerald-600 text-sm">
                    Upload High-Res Photo
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
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-inner group">
                  <img
                    src={uploadImage.url}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadImage({ image: null, url: null })}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MdClose />
                  </button>
                </div>
              )}
            </div>

            {/* Live Preview Card */}
            <div className="bg-emerald-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-800 rounded-full blur-3xl opacity-50" />
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4 italic">
                Draft Preview
              </p>
              <h3 className="text-2xl font-black truncate">
                {watchedValues.name || "Specimen Name"}
              </h3>
              <p className="text-sm text-emerald-200 mb-4">
                {watchedValues.category}
              </p>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">
                  ${watchedValues.price || "0.00"}
                </div>
                <div className="text-xs text-emerald-300">
                  Qty: {watchedValues.quantity}
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
