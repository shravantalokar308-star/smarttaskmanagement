const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (pre-save hook will hash password)
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Google ID Token & login/register user
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('❌ GOOGLE_CLIENT_ID is not configured in backend/.env');
      return res.status(500).json({ 
        message: 'Google Sign-In is not configured on the server. Admin must set GOOGLE_CLIENT_ID in their backend/.env' 
      });
    }

    let email, name;

    // Handle access token (starts with 'ya29.') or standard ID Token
    if (token.startsWith('ya29.')) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Google OAuth access token verification failed');
      }
      
      const userData = await response.json();
      email = userData.email;
      name = userData.name;
    } else {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Login existing user
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        token: generateToken(user._id),
      });
    } else {
      // Register new user with random password
      const randomPassword = Math.random().toString(36).slice(-12) + 'G!';
      
      // Select random avatar color
      const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        avatarColor: randomColor,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Google verification failed:', error.message);
    res.status(401).json({ message: 'Google token authentication failed' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
};

