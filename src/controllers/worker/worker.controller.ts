import { ReqHandler } from '../../types';
import { db, workerTypes } from '../../db';
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';

export const getWorkerTypes: ReqHandler<object> = async function (_req, res) {
  const workerTypeList = await db
    .select({ id: workerTypes.id, type: workerTypes.name })
    .from(workerTypes)
    .where(eq(workerTypes.isActive, true));

  res.status(StatusCodes.OK).json({ status: 'Success', data: workerTypeList });
};
