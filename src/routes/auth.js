const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// In-memory storage for demo mode (when MongoDB is not available)
let users = [];
let userIdCounter = 1;

// Try to import User model, fallback to null if MongoDB is not available
let User = null;
try {
  User = require('../models/User');
} catch (error) {
  console.log('Running in demo mode - User model not available');
}

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Register a new user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user;
      
      if (User && isMongoConnected()) {
        // MongoDB is available - use database
        user = await User.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
          name,
          email,
          password
        });

        await user.save();
      } else {
        // Demo mode - use in-memory storage
        user = users.find(u => u.email === email);
        if (user) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = {
          id: userIdCounter++,
          name,
          email,
          password: hashedPassword,
          planLevel: 'free'
        };

        users.push(user);
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              plan: user.planLevel || 'free'
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    let user;
    
    if (User && isMongoConnected()) {
      // MongoDB is available - use database
      user = await User.findById(req.user.id).select('-password');
    } else {
      // Demo mode - use in-memory storage
      user = users.find(u => u.id == req.user.id);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.planLevel || 'free'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user;
      let isMatch = false;

      if (User && isMongoConnected()) {
        // MongoDB is available - use database
        user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        isMatch = await user.comparePassword(password);
      } else {
        // Demo mode - use in-memory storage
        user = users.find(u => u.email === email);
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              plan: user.planLevel || 'free'
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;