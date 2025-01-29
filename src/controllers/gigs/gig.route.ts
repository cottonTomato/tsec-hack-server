import { Router } from 'express';
import { addGig, getGigs } from './gig.controller';
import { getGigsDto } from './gig.dto';
import { validatorFactory } from '../../middlewares';

export const gigsRouter = Router();

gigsRouter.post('/', validatorFactory(getGigsDto), getGigs);
gigsRouter.post('/add', addGig);
