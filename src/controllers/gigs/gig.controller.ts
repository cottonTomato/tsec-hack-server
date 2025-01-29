import { StatusCodes } from 'http-status-codes';
import { ReqHandler } from '../../types';
import { IGetGigsDto } from './gig.dto';
import { db, gigs, users } from '../../db';
import { eq, sql, and, inArray } from 'drizzle-orm';

export const getGigs: ReqHandler<IGetGigsDto> = async function (req, res) {
  const { lat, lng, maxDistance, skills } = req.body;

  const gigList = await db
    .select({
      name: gigs.title,
      startDate: gigs.startDate,
      endDate: gigs.endDate,
      description: gigs.description,
      payPerDay: gigs.payPerDay,
      employer: users.name,
      employerRating: users.averageRating,
      images: gigs.images,
      distance: sql<number>`
        6731 * acos(
          cos(radian(${lat})) * cos(radian(${gigs.lat})) * 
          cos(radians(${lng}) - radians(${gigs.lng})) + 
          sin(radians(${lat})) * sin(radians(${gigs.lat}))
        )`.as('distance'),
      location: { lat: gigs.lat, lng: gigs.lng },
    })
    .from(gigs)
    .leftJoin(users, eq(gigs.employerId, users.id))
    .where(
      and(
        sql`6731 * acos(
          cos(radian(${lat})) * cos(radian(${gigs.lat})) * 
          cos(radians(${lng}) - radians(${gigs.lng})) + 
          sin(radians(${lat})) * sin(radians(${gigs.lat}))) < ${maxDistance}`,
        inArray(gigs.workerType, skills)
      )
    )
    .orderBy(sql`distance`);

  res.status(StatusCodes.OK).json({ status: 'Success', data: gigList });
};

export const addGig: ReqHandler<object> = function (req, res) {
  // const {} = req.body;

  res.status(StatusCodes.OK).json({ status: 'Success' });
};

export const getCurrentGigs: ReqHandler<object> = function (req, res) {};

export const getPastGigs: ReqHandler<object> = function (req, res) {};
