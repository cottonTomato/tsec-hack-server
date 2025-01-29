import { Router } from 'express';
import { addGig, getGigs } from './gig.controller';

export const gigsRouter = Router();

gigsRouter.post('/', addGig);
gigsRouter.get('/', getGigs);
