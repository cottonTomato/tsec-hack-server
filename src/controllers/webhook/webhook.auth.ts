import { ReqHandler } from '../../types';
import { db, users, workerTypes, userRoles } from '../../db';
import { eq, and } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { IGetWorkerDto } from '../worker/worker.dto';
import { use } from 'passport';

export const getCompany = async (phoneNumber: string) => {
  const [user] = await db
    .select({
      userId: users.id,
      userName: users.name
    })
    .from(users)
    .where(and(eq(users.phone, phoneNumber), eq(users.role, 'company')));

    if (!user) {
        return null;
    }

  return {
    id: user.userId,
    name: user.userName
  };
};
