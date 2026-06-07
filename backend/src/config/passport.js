import "./env.js";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientID && !googleClientID.startsWith("your_")) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"), null);

          const avatar = profile.photos?.[0]?.value || "";
          let user = await User.findOne({ email });

          if (!user) {
            // Matches the public registration policy: self-signup always creates a Candidate account.
            // HR/Admin/Employee accounts are created internally — never via OAuth.
            user = await User.create({
              name: profile.displayName || "New User",
              email,
              googleId: profile.id,
              avatar,
              role: "Candidate",
            });
            console.log("New Candidate account created via Google OAuth:", email);
          } else {
            let changed = false;
            if (!user.googleId) { user.googleId = profile.id; changed = true; }
            if (!user.avatar && avatar) { user.avatar = avatar; changed = true; }
            if (changed) await user.save();
          }

          return done(null, user);
        } catch (err) {
          console.error("Google Auth Error:", err);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth not configured — skipping Google strategy setup.");
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
