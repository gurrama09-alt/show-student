const mongoose = require('mongoose');

const URL_MSG = 'Enter a valid URL starting with http:// or https://';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    technologies: {
      type: [String],
      validate: [(v) => v.length > 0, 'Add at least one technology'],
    },
    githubUrl: {
      type: String,
      required: [true, 'GitHub URL is required'],
      trim: true,
      match: [/^https?:\/\/\S+\.\S+/i, URL_MSG],
    },
    liveUrl: { type: String, trim: true, default: '', match: [/^$|^https?:\/\/\S+\.\S+/i, URL_MSG] },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
