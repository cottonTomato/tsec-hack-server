import { Router } from 'express';
import { validatorFactory } from '../../middlewares';
import {
  registerEmployee,
  registerEmployer,
  sendOtp,
  verifyOtp,
} from './auth.controller';
import {
  registerEmployeeDto,
  registerEmployerDto,
  sendOTPDto,
  verifyOTPDto,
} from './auth.dto';

export const authRouter = Router();

authRouter.post(
  '/register/employer',
  validatorFactory(registerEmployerDto),
  registerEmployer
);

authRouter.post(
  '/register/employee',
  validatorFactory(registerEmployeeDto),
  registerEmployee
);

authRouter.post('/send-otp', validatorFactory(sendOTPDto), sendOtp);
authRouter.post('/verify-otp', validatorFactory(verifyOTPDto), verifyOtp);
