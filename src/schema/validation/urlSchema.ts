import { z } from "zod";

export const createUrlSchema = z.object({
  body: z.object({
    longUrl: z.url("Invalid URL format"),
    customAlias: z.string().min(3).max(20).optional(),
    expiresAt: z.iso.datetime().optional(),
  }),
});

export const shortCodeSchema = z.object({
  params: z.object({
    shortCode: z.string().min(1),
  }),
});
