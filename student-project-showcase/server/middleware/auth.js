const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function userFromHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

// Requires a valid token
exports.protect = async (req, res, next) => {
  const user = await userFromHeader(req);
  if (!user) return res.status(401).json({ message: 'Please log in to continue' });
  req.user = user;
  next();
};

// Attaches req.user when a valid token is present, otherwise continues as guest
exports.optionalAuth = async (req, res, next) => {
  req.user = await userFromHeader(req);
  next();
};

// Role-based access: restrictTo('admin')
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do that' });
  }
  next();
};
