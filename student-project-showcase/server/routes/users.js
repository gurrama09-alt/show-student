const router = require('express').Router();
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, restrictTo } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, restrictTo('admin'));

// GET /api/users   (admin: all users with project counts)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const counts = await Project.aggregate([{ $group: { _id: '$student', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(users.map((u) => ({ ...u, projectCount: map[String(u._id)] || 0 })));
  })
);

// DELETE /api/users/:id   (admin: removes the user and their projects)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Project.deleteMany({ student: user._id });
    await user.deleteOne();
    res.json({ message: 'User and their projects deleted' });
  })
);

module.exports = router;
