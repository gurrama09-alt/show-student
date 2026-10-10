const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
});

// POST /api/auth/register  (always creates a student)
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, department } = req.body;
    if (await User.findOne({ email: String(email || '').toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, department, role: 'student' });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

// PUT /api/auth/me  (update own profile)
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, department } = req.body;
    if (name !== undefined) req.user.name = name;
    if (department !== undefined) req.user.department = department;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  })
);

module.exports = router;
