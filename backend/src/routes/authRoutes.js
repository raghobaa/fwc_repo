import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// ------------------------------
// Passport Google Strategy Configuration
// ------------------------------
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        // Create new user if not exists
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || '',
          googleId: profile.id,
          isGoogleUser: true
        });
        await user.save();
      }
      
      // Generate JWT token for frontend
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((data, done) => {
  done(null, data.user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ------------------------------
// Google OAuth Routes
// ------------------------------

// Redirect to Google authentication page
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback URL
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

// Get current authenticated user
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// -------------------------------------------------------
// Email/Password Auth Routes
// -------------------------------------------------------

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/verify-token
router.get('/verify-token', verifyToken);

export default router;