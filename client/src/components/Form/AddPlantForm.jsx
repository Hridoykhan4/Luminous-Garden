import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TbFidgetSpinner } from "react-icons/tb";
import { MdCloudUpload, MdClose, MdAttachMoney } from "react-icons/md";
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
  description: z.string().min(20, "Provide a detailed description"),
  price: z.coerce.number().positive("Price must be > 0"),
  quantity: z.coerce.number().int().min(1, "Quantity must be 1+"),
});

const AddPlantForm = ({ onSubmit, uploadImage, setUploadImage, loading }) => {
  const form = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: { name: "", description: "", price: 0, quantity: 1 },
  });

  return (
    <div className="max-w-5xl mx-auto bg-card border rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <HiOutlineIdentification size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">
            Add New Specimen
          </h2>
          <p className="text-muted-foreground">
            Fill in the details to list your plant in the garden.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* Left Side: General Info */}
          <div className="lg:col-span-7 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary">
                    Plant Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Variegated Monstera"
                      className="h-14 rounded-2xl border-2 focus-visible:ring-primary"
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
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary">
                    Category
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl border-2">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl bg-white">
                      {["Indoor", "Outdoor", "Succulent", "Flowering"].map(
                        (cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary">
                    Description & Care
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain soil needs, sunlight, and watering..."
                      className="min-h-45 rounded-2xl border-2 p-4 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Side: Media & Pricing */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-secondary/20 rounded-4xl border-2 border-dashed border-secondary-foreground/10">
              <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">
                Plant Cover Image
              </FormLabel>
              {!uploadImage.url ? (
                <label className="flex flex-col items-center justify-center w-full h-52 bg-background border-2 border-dashed rounded-3xl cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
                  <MdCloudUpload
                    size={48}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                  <span className="mt-2 text-sm font-semibold">
                    Click to upload
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
                <div className="relative rounded-3xl overflow-hidden group aspect-video border-2">
                  <img
                    src={uploadImage.url}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadImage({ image: null, url: null })}
                    className="absolute top-3 right-3 p-2 bg-destructive text-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-primary flex items-center gap-1">
                      <MdAttachMoney /> Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-12 rounded-xl border-2"
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
                    <FormLabel className="text-xs font-bold text-primary">
                      Quantity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-12 rounded-xl border-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl text-xl font-black shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              disabled={loading}
            >
              {loading ? (
                <TbFidgetSpinner className="animate-spin text-2xl" />
              ) : (
                "PUBLISH PLANT"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPlantForm;
