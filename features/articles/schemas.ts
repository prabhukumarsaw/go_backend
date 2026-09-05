import { z } from "zod";

export const articleFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title must be less than 300 characters"),
  slug: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  category_ids: z.array(z.number()),
  tag_ids: z.array(z.number()),
  is_breaking: z.boolean(),
  is_featured: z.boolean(),
  is_national: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;
