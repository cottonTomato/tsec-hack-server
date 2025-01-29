import {
  pgTable,
  serial,
  text,
  timestamp,
  time,
  boolean,
  check,
  integer,
  json,
  doublePrecision,
  index,
  pgEnum,
  date,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoles = pgEnum('user_roles', ['worker', 'company']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    phone: varchar('phone', { length: 10 }).unique().notNull(),
    companyDetail: text('company_detail'),
    role: userRoles('role').notNull(),
    averageRating: doublePrecision('average_rating').default(0),
    ratingCount: integer('rating_count').default(0),
    image: varchar('photo'),
  },
  (user) => [
    index('role_idx').on(user.role),
    index('rating_idx').on(user.averageRating),
  ]
);

export const workerTypes = pgTable('worker_types', {
  id: serial('id').primaryKey(),
  name: varchar('worker_type_name').unique().notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wokerExpertise = pgTable('worker_expertise', {
  workerId: serial('woker_id').references(() => users.id),
  workerTypeId: serial('worker_type_id').references(() => workerTypes.id),
});

export const gigTypes = pgEnum('gig_types', ['random', 'fixed']);

export const gigs = pgTable(
  'gig',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 50 }).notNull(),
    description: text('description'),
    employerId: serial('employer_id').references(() => users.id),
    workerType: serial('worker_type').references(() => workerTypes.id),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    payPerDay: integer('pay_per_day').notNull(),
    images: json('images').$type<string[]>(),
    gigType: gigTypes('gig_type').notNull(),
    startDate: date('start_date').notNull().defaultNow(),
    endDate: date('end_date').notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (gig) => [
    index('pay_idx').on(gig.payPerDay),
    index('employer_idx').on(gig.employerId),
    index('location_idx').on(gig.lat, gig.lng),
    index('start_date_idx').on(gig.startDate),
    index('end_date_idx').on(gig.endDate),
  ]
);

export const ratings = pgTable(
  'ratings',
  {
    id: serial('id').primaryKey(),
    employerId: integer('employer_id').references(() => users.id),
    workerId: integer('worker_id').references(() => users.id),
    rating: integer('rating').notNull(),
    review: text('review'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (rating) => [
    check('age_check1', sql`${rating.rating} >= 1 AND ${rating.rating} <= 5`),
  ]
);

export const gigApplicationStatus = pgEnum('gig_application_status', [
  'completed',
  'applied',
  'cancelled',
  'progressing',
]);

export const gigApplications = pgTable(
  'gig_applications',
  {
    id: serial('id').primaryKey(),
    workerId: serial('worker_id').references(() => users.id),
    gigId: serial('gig_id').references(() => gigs.id),
    status: gigApplicationStatus('gig_status').notNull(),
    appliedAt: timestamp('applied_at').defaultNow(),
  },
  (gigApplication) => [index('worker_idx').on(gigApplication.workerId)]
);

export const dailyGigApplicationStatus = pgEnum(
  'daily_gig_application_status',
  ['present', 'absent', 'paid']
);

export const dailyGigApplicationTrack = pgTable(
  'daily_gig_application_track',
  {
    id: serial('id').primaryKey(),
    gigApplicationId: serial('gig_application_id').references(
      () => gigApplications.id
    ),
    date: date('date').defaultNow(),
    status: dailyGigApplicationStatus('todays_status').notNull(),
    statusChangedAt: timestamp('status_changed_at').defaultNow(),
  },
  (dailyGigApplicationTracking) => [
    index('gig_application_idx').on(
      dailyGigApplicationTracking.gigApplicationId
    ),
  ]
);
