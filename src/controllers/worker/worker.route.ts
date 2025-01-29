import { Router } from 'express';
import { getWorkerTypes, getWorker } from './worker.controller';

export const workerRouter = Router();

workerRouter.get('/types', getWorkerTypes);
workerRouter.get('/phone', getWorker);
