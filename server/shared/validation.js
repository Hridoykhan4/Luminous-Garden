const { z } = require("zod");

const plantSchema = z.object({
  name: z.string().min(3, "Name must be 3+ characters"),
  category: z.enum(["Indoor", "Outdoor", "Succulent", "Flowering"]),
  description: z
    .string()
    .min(20, "Provide a detailed description (min 20 chars)"),
  price: z.coerce.number().positive("Price must be > 0"),
  quantity: z.coerce.number().int().min(1, "Quantity must be 1+"),
});

module.exports = { plantSchema };
