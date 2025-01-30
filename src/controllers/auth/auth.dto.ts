import { z } from 'zod';

export const sendOTPDto = z.object({
  phonenumber: z.string().length(10),
});

export type ISendOTPDto = z.infer<typeof sendOTPDto>;

export const verifyOTPDto = z.object({
  code: z.string(),
  phonenumber: z.string().length(10),
});

export type IVerifyOTPDto = z.infer<typeof verifyOTPDto>;

export const registerEmployerDto = z.object({
  name: z.string().max(50),
  phone: z.string().length(10),
});

export type IRegisterEmployerDto = z.infer<typeof registerEmployerDto>;

export const registerEmployeeDto = z.object({
  name: z.string().max(50),
  phone: z.string().length(10),
  dob: z.coerce.date(),
  skills: z.number().array().min(1),
});

export type IRegisterEmployeeDto = z.infer<typeof registerEmployeeDto>;
