import { defineCollection, z } from "astro:content";

const sharedImage = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional()
});

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    coverImage: sharedImage.optional(),
    socialImage: z.string().optional(),
    canonical: z.string().optional(),
    linkedinUrl: z.string().optional(),
    featured: z.boolean().default(false),
    cta: z
      .object({
        label: z.string(),
        href: z.string()
      })
      .optional()
  })
});

const features = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    heroImage: sharedImage,
    gallery: z.array(sharedImage).default([]),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    testimonials: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          organization: z.string(),
          image: sharedImage.optional()
        })
      )
      .default([]),
    related: z.array(z.object({ label: z.string(), href: z.string() })).default([])
  })
});

export const collections = { articles, features };
