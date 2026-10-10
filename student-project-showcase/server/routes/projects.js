const router = require('express').Router();
const Project = require('../models/Project');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseTech = (t) =>
  [...new Set((Array.isArray(t) ? t : String(t || '').split(',')).map((s) => s.trim()).filter(Boolean))];
const populateStudent = { path: 'student', select: 'name department' };

// GET /api/projects?q=&tech=&page=&limit=   (public: published projects only)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, tech } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 9, 50);

    const filter = { status: 'published' };
    if (tech) filter.technologies = { $regex: `^${escapeRegex(tech)}$`, $options: 'i' };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { technologies: rx }];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(populateStudent),
      Project.countDocuments(filter),
    ]);
    res.json({ projects, total, page, pages: Math.ceil(total / limit) || 1 });
  })
);

// GET /api/projects/meta/technologies  (for the filter dropdown)
router.get(
  '/meta/technologies',
  asyncHandler(async (req, res) => {
    const list = await Project.distinct('technologies', { status: 'published' });
    res.json(list.sort((a, b) => a.localeCompare(b)));
  })
);

// GET /api/projects/mine   (logged-in student's own projects, any status)
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    res.json(await Project.find({ student: req.user._id }).sort({ createdAt: -1 }));
  })
);

// GET /api/projects/admin/all   (admin: every project, any status)
router.get(
  '/admin/all',
  protect,
  restrictTo('admin'),
  asyncHandler(async (req, res) => {
    res.json(await Project.find().sort({ createdAt: -1 }).populate(populateStudent));
  })
);

// GET /api/projects/:id   (hidden projects are visible only to the owner and admins)
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate(populateStudent);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isOwner = req.user && project.student._id.equals(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    if (project.status === 'hidden' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ ...project.toObject(), canManage: Boolean(isOwner || isAdmin) });
  })
);

// POST /api/projects   (logged-in; owner is always the caller)
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { title, description, technologies, githubUrl, liveUrl } = req.body;
    const project = await Project.create({
      title,
      description,
      technologies: parseTech(technologies),
      githubUrl,
      liveUrl,
      student: req.user._id,
    });
    res.status(201).json(project);
  })
);

// PUT /api/projects/:id   (owner or admin)
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'admin' && !project.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own projects' });
    }
    ['title', 'description', 'githubUrl', 'liveUrl'].forEach((f) => {
      if (req.body[f] !== undefined) project[f] = req.body[f];
    });
    if (req.body.technologies !== undefined) project.technologies = parseTech(req.body.technologies);
    await project.save();
    res.json(project);
  })
);

// PATCH /api/projects/:id/moderate   (admin: hide/publish, feature)
router.patch(
  '/:id/moderate',
  protect,
  restrictTo('admin'),
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.body.status) project.status = req.body.status;
    if (req.body.featured !== undefined) project.featured = Boolean(req.body.featured);
    await project.save();
    res.json(project);
  })
);

// DELETE /api/projects/:id   (owner or admin)
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'admin' && !project.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own projects' });
    }
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  })
);

module.exports = router;
