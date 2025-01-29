import { z } from 'zod';

export const getWorkerDto = z.object({
  phone: z.string().length(10),
});

export type IGetWorkerDto = z.infer<typeof getWorkerDto>;
