import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import bcrypt from "bcrypt";
import { adminsTable } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing in environment variables.");
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const admins = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.email, email));

        const admin = admins[0];
        if (!admin) return done(null, false, { message: "Admin not found" });

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return done(null, false, { message: "Incorrect password" });

        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: (req) => req?.cookies?.admintoken || null,
      secretOrKey: jwtSecret,
    },
    async (jwt_payload, done) => {
      try {
        const admins = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.id, jwt_payload.id));

        const admin = admins[0];
        if (!admin) return done(null, false);
        return done(null, admin);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
