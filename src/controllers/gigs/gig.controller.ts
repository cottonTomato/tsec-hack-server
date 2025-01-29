import { StatusCodes } from 'http-status-codes';
import { ReqHandler } from '../../types';
import { IGetGigsDto } from './gig.dto';
import { mapboxKey } from '../../common/config';
import { db, gigs, users, workerTypes } from '../../db';
import { eq, sql, and, inArray } from 'drizzle-orm';

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
        inArray(workerTypes.name, skills)
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

export const addGig: ReqHandler<object> = function (req, res) {
  // const {} = req.body;

  res.status(StatusCodes.OK).json({ status: 'Success' });
};

export const getCurrentGigs: ReqHandler<object> = function (req, res) {};

export const getPastGigs: ReqHandler<object> = function (req, res) {};
