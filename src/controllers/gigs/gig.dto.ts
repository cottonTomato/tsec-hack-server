import { z } from 'zod';

export const getGigsDto = z.object({
  lat: z.string(),
  lng: z.string(),
  maxDistance: z.string(),
  skills: z.string().array(),
});

export type IGetGigsDto = z.infer<typeof getGigsDto>;

export const addGigDto = z.object({
  title: z.string().min(3).max(50),
  description: z.string().optional(),
  employerId: z.number().int().positive(),
  workerType: z.number().int().positive(),
  lat: z.number(),
  lng: z.number(),
  payPerDay: z.number().int().min(100),
  images: z.array(z.string().url()).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid startDate',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid endDate',
  }),
});

export type IAddGigDto = z.infer<typeof addGigDto>;
