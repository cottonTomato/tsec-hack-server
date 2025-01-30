import { StatusCodes } from 'http-status-codes';
import { ReqHandler } from '../../types';
import { IGetGigsDto, IAddGigDto, IApplyForGigsDto } from './gig.dto';
import { mapboxKey } from '../../common/config';
import {
  db,
  gigs,
  users,
  workerTypes,
  gigApplications,
  dailyGigApplicationTrack,
} from '../../db';
import { eq, sql, and, inArray, desc, gte } from 'drizzle-orm';

interface MapboxResponse {
  features: Array<{
    properties: {
      context: {
        district: { name: string } | undefined;
        place: { name: string } | undefined;
        locality: { name: string } | undefined;
      };
    };
  }>;
}

export const applyForGig: ReqHandler<IApplyForGigsDto> = async function (
  req,
  res
) {
  const { gigId } = req.body;
  const userId = req.user.userId;

  const existingApplication = await db
    .select()
    .from(gigApplications)
    .where(
      and(
        eq(gigApplications.workerId, userId),
        eq(gigApplications.gigId, gigId)
      )
    )
    .limit(1);

  if (existingApplication.length > 0) {
    res.status(StatusCodes.CONFLICT).json({
      status: 'Failure',
    });
    return;
  }

  const [newApplication] = await db
    .insert(gigApplications)
    .values({
      workerId: userId,
      gigId,
      status: 'applied',
      appliedAt: new Date(),
    })
    .returning();

  res.status(StatusCodes.CREATED).json({
    status: 'Success',
    data: newApplication,
  });
};

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
          cos(radians(${lat})) * cos(radians(${gigs.lat})) * 
          cos(radians(${lng}) - radians(${gigs.lng})) + 
          sin(radians(${lat})) * sin(radians(${gigs.lat}))
        )`.as('distance'),
      location: { lat: gigs.lat, lng: gigs.lng },
      workerType: workerTypes.name,
    })
    .from(gigs)
    .leftJoin(users, eq(gigs.employerId, users.id))
    .leftJoin(workerTypes, eq(gigs.workerType, workerTypes.id))
    .where(
      and(
        sql`6731 * acos(
          cos(radians(${lat})) * cos(radians(${gigs.lat})) * 
          cos(radians(${lng}) - radians(${gigs.lng})) + 
          sin(radians(${lat})) * sin(radians(${gigs.lat}))) < ${maxDistance}`,
        inArray(workerTypes.id, skills)
      )
    )
    .orderBy(sql`distance`);

  const locationGigList = gigList.map(async (gig) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v6/reverse?longitude=${gig.location.lng}&latitude=${gig.location.lat}?access_token=${mapboxKey}&types=place,locality,region`
    );
    const data = (await response.json()) as MapboxResponse;
    const context = data.features[0].properties.context;

    const locality = context['locality']?.name;
    const place = context['place']?.name;
    const district = context['district']?.name;
    return {
      ...gig,
      location: {
        locality: locality ?? 'Not available',
        district: district ?? 'Not available',
        place: place ?? 'Not available',
      },
    };
  });

  res.status(StatusCodes.OK).json({ status: 'Success', data: locationGigList });
};

export const addGig: ReqHandler<IAddGigDto> = async function (req, res) {
  const [newGig] = await db
    .insert(gigs)
    .values({
      ...req.body,
    })
    .returning();

  res.status(StatusCodes.CREATED).json({ status: 'Success', data: newGig });
};

const getCurrentDateString = function () {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
};

export const getCurrentGigs: ReqHandler<object> = async function (_req, res) {
  const currentDate = getCurrentDateString();
  const ongoingGigs = await db
    .select({
      title: gigs.title,
      description: gigs.description,
      employer: users.name,
      employerImage: users.photo,
      status: dailyGigApplicationTrack.status,
      payPerDay: gigs.payPerDay,
      endDate: gigs.endDate,
    })
    .from(gigApplications)
    .innerJoin(gigs, eq(gigApplications.gigId, gigs.id))
    .leftJoin(
      dailyGigApplicationTrack,
      and(
        eq(gigApplications.id, dailyGigApplicationTrack.gigApplicationId),
        eq(dailyGigApplicationTrack.date, currentDate)
      )
    )
    .leftJoin(users, eq(users.id, gigs.employerId))
    .where(eq(gigApplications.status, 'progressing'))
    .orderBy(desc(gigApplications.appliedAt));

  res.status(StatusCodes.OK).json({
    status: 'Success',
    data: ongoingGigs,
  });
};

export const getPastGigs: ReqHandler<object> = async function (_req, res) {
  const currentDate = getCurrentDateString();

  const pastGigs = await db
    .select({
      title: gigs.title,
      description: gigs.description,
      employer: users.name,
      employerImage: users.photo,
      status: dailyGigApplicationTrack.status,
      endDate: gigs.endDate,
    })
    .from(gigApplications)
    .innerJoin(gigs, eq(gigApplications.gigId, gigs.id))
    .leftJoin(
      dailyGigApplicationTrack,
      and(
        eq(gigApplications.id, dailyGigApplicationTrack.gigApplicationId),
        gte(dailyGigApplicationTrack.date, currentDate)
      )
    )
    .where(
      and(
        eq(gigApplications.status, 'completed'),
        eq(gigApplications.status, 'cancelled')
      )
    )
    .orderBy(desc(gigApplications.appliedAt));

  res.status(StatusCodes.OK).json({
    status: 'Success',
    data: pastGigs,
  });
};
