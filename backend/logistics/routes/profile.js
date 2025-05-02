const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  },
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// POST: Signup
router.post('/signup', async (req, res) => {
  const { name, role, email, password } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingProfile = await Profile.findOne({ email });
    if (existingProfile) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = new Profile({
      name,
      role,
      email,
      password: hashedPassword,
    });

    const newProfile = await profile.save();
    const secret = process.env.JWT_SECRET || 'default_secret_key'; // Fallback secret
    const token = jwt.sign({ id: newProfile._id, email: newProfile.email }, secret, {
      expiresIn: '1h',
    });

    console.log('Signup successful for', email);
    res.status(201).json({ token, profile: newProfile });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ message: error.message });
  }
});

// POST: Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    console.log('Login attempt for', email);
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const profile = await Profile.findOne({ email });
      if (!profile) {
        console.log('Profile not found for', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, profile.password);
      if (!isMatch) {
        console.log('Password mismatch for', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const secret = process.env.JWT_SECRET || 'default_fallback_secret_2025'; // Fallback secret
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }
      const token = jwt.sign({ id: profile._id, email: profile.email }, secret, {
        expiresIn: '1h',
      });
  
      console.log('Login successful for', email, 'with token:', token);
      res.json({ token, profile });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'An error occurred during login' });
    }
  });
  
// GET profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET profile by email (protected)
router.get('/:email', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE profile (protected)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.name = req.body.name || profile.name;
    profile.role = req.body.role || profile.role;
    profile.email = req.body.email || profile.email;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE profile picture (protected)
router.put('/me/picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (req.file) {
      profile.profilePicture = req.file.path;
    }

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE password (protected)
router.put('/me/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  try {
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const isMatch = await bcrypt.compare(currentPassword, profile.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    profile.password = await bcrypt.hash(newPassword, 10);
    await profile.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;