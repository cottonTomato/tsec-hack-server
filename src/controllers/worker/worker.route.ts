import { Router } from 'express';
import { getWorkerTypes } from './worker.controller';

export const workerRouter = Router();

workerRouter.get('/types', getWorkerTypes);
