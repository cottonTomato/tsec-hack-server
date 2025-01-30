import { ReqHandler } from '../../types';
import { StatusCodes } from 'http-status-codes';
import type {
  IRegisterEmployerDto,
  IRegisterEmployeeDto,
  ISendOTPDto,
  IVerifyOTPDto,
} from './auth.dto';
import jwt from 'jsonwebtoken';
import { jwtTokenSecret, jwtTokenLifetime } from '../../common/config';
import { db, users, wokerExpertise } from '../../db';
import { getTwilioClient } from '../../services/sms.service';

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

export const sendOtp: ReqHandler<ISendOTPDto> = async function (req, res) {
  const { phonenumber } = req.body;
  const client = getTwilioClient();

  const verification = await client.verify.v2
    .services('VAe37c7238245866b1436703aee8c72151')
    .verifications.create({
      channel: 'sms',
      to: '+91' + phonenumber,
    });

  if (verification.status == 'approved') {
    res.status(StatusCodes.OK).json({ status: 'Success' });
    return;
  }
  res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ status: 'Failure' });
};

export const verifyOtp: ReqHandler<IVerifyOTPDto> = async function (req, res) {
  const { code, phonenumber } = req.body;
  const client = getTwilioClient();

  const verificationCheck = await client.verify.v2
    .services('VAe37c7238245866b1436703aee8c72151')
    .verificationChecks.create({
      code,
      to: '+91' + phonenumber,
    });

  if (verificationCheck.status == 'approved') {
    res.status(StatusCodes.OK).json({ status: 'Success' });
    return;
  }
  res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ status: 'Failure' });
};
