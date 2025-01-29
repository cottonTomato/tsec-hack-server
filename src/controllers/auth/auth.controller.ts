import { ReqHandler } from '../../types';
import { StatusCodes } from 'http-status-codes';
import type { IRegisterEmployerDto, IRegisterEmployeeDto } from './auth.dto';
import jwt from 'jsonwebtoken';
import { jwtTokenSecret, jwtTokenLifetime } from '../../common/config';
import { db, users, wokerExpertise } from '../../db';

export const registerEmployer: ReqHandler<IRegisterEmployerDto> =
  async function (req, res) {
    const { phone, name } = req.body;

    const [{ userId }] = await db
      .insert(users)
      .values({ phone, name, role: 'company' })
      .returning({ userId: users.id });

    const token = jwt.sign({ userId }, jwtTokenSecret, {
      expiresIn: jwtTokenLifetime,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', data: { token } });
  };

export const registerEmployee: ReqHandler<IRegisterEmployeeDto> =
  async function (req, res) {
    const { phone, name, skills } = req.body;

    const userId = await db.transaction(async (txn) => {
      const [{ uid }] = await txn
        .insert(users)
        .values({ phone, name, role: 'worker' })
        .returning({ uid: users.id });

      const userSkills = skills.map((skill) => {
        return {
          workerTypeId: skill,
          workerId: uid,
        };
      });

      await txn.insert(wokerExpertise).values(userSkills);

      return uid;
    });

    const token = jwt.sign({ userId }, jwtTokenSecret, {
      expiresIn: jwtTokenLifetime,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', data: { token } });
  };
