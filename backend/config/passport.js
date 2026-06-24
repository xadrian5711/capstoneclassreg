import { Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/User.js";
import "dotenv/config";

// 1. Write a custom function to pull the token from the httpOnly cookie
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token; // Grabs the exact cookie we set during login!
  }
  return token;
};

// 2. Pass that custom extractor into Passport's options
const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

export const applyPassportStrategy = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Find the user based on the decoded token
        const user = await User.findById(jwt_payload.id);

        if (user) {
          // Success! Passport automatically attaches this user object to `req.user`
          return done(null, user);
        }
        return done(null, false); // No user found
      } catch (error) {
        return done(error, false); // Server error
      }
    }),
  );
};
