import type { RequestHandler, ErrorRequestHandler } from 'express';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type AckResponse = { status: 'Success' | 'Failure'; data?: object };
type ReqHandler<TReqBody> = RequestHandler<
  object,
  AckResponse,
  TReqBody,
  object
>;
type ErrHandler = ErrorRequestHandler<object, AckResponse, object, object>;

declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
      };
    }
  }
}
