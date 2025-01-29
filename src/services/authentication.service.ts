import passport from 'passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { jwtTokenSecret } from '../common/config';
import jwt from 'jsonwebtoken';
import { db } from '../db/db';
import { users } from '../db';
import { eq } from 'drizzle-orm';

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtTokenSecret,
    },
    async (payload: jwt.JwtPayload, done) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId));

      if (user) {
        return done(null, { userId: user.id });
      }

      return done(null, false);
    }
  )
);
