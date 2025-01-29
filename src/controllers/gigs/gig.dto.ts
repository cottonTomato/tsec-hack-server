import { z } from 'zod';

export const getGigsDto = z.object({
  lat: z.string(),
  lng: z.string(),
  maxDistance: z.string(),
  skills: z.number().array(),
});

export type IGetGigsDto = z.infer<typeof getGigsDto>;

export const addGigDto = z.object({});

export type IAddGigDto = z.infer<typeof addGigDto>;
