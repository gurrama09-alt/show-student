require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users', require('./routes/users'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler: turns Mongoose errors into readable 400 responses
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('. ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  if (err.code === 11000) return res.status(409).json({ message: 'That value is already in use' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  });
