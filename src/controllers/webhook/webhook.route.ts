import { Router } from 'express';

export const webhookRouter = Router();


// Add the new webhook GET request handler
webhookRouter.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = req.query['hub.verify_token'];

  if (mode === 'subscribe' && verifyToken === 'meatyhamhock') {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});