import { ReqHandler } from '../../types';
import { db, users, workerTypes } from '../../db';
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { IGetWorkerDto } from './worker.dto';

export const getWorkerTypes: ReqHandler<object> = async function (_req, res) {
  const workerTypeList = await db
    .select({ id: workerTypes.id, type: workerTypes.name })
    .from(workerTypes)
    .where(eq(workerTypes.isActive, true));

  res.status(StatusCodes.OK).json({ status: 'Success', data: workerTypeList });
};

export const getWorker: ReqHandler<IGetWorkerDto> = async function (req, res) {
  const { phone } = req.body;

  const [{ userId }] = await db
    .select({ userId: users.id })
    .from(users)
    .where(eq(users.phone, phone));

  res.status(StatusCodes.OK).json({ status: 'Success', data: { userId } });
};
