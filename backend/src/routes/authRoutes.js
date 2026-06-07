import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerUser, loginUser, verifyToken, setupAdmin } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* Local Auth */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-token", verifyToken);

/* One-time admin setup — only works when zero Admins exist */
router.post("/setup", setupAdmin);

/* Google OAuth - Registration / Login */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/* Google OAuth - Callback */
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${CLIENT_URL}/?googleError=true`, session: false }),
  (req, res) => {
    // Issue JWT after Google sign-in / registration
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.redirect(`${CLIENT_URL}/dashboard?token=${token}&role=${req.user.role}`);
  }
);

/*Get current user with JWT */
router.get("/user", protect, (req, res) => {
  if (req.user) return res.json(req.user);
  res.status(401).json({ message: "Unauthorized" });
});

/* Logout */
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

export default router;
