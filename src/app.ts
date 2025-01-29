import express from 'express';
import 'express-async-errors';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';

import { port, allowedOrigin } from './common/config';
import {
  accessLogger,
  notFoundHandler,
  globalErrorHandler,
} from './middlewares';
import './services/authentication.service';
import {
  authRouter,
  webhookRouter,
  workerRouter,
  gigsRouter,
} from './controllers';

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(accessLogger);

app.get('/', (_req, res) => {
  console.log(_req.body);
  res.send('<h1>Hello, World</h1>');
});

app.use('/auth', authRouter);
app.use('/worker', workerRouter);
app.use('/webhook', webhookRouter);
app.use('/gigs', gigsRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

httpServer.listen(port, () => {
  console.log(`Server Listening to port: ${port}...`);
});
