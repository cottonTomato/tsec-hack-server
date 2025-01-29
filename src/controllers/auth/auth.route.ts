import { Router } from 'express';
import { validatorFactory } from '../../middlewares';
import { registerEmployee, registerEmployer } from './auth.controller';
import { registerEmployeeDto, registerEmployerDto } from './auth.dto';

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
