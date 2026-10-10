require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Project.deleteMany()]);

  const [admin, asha, ravi] = await User.create([
    { name: 'Admin', email: 'admin@showcase.dev', password: 'admin123', role: 'admin' },
    { name: 'Asha Reddy', email: 'asha@showcase.dev', password: 'student123', department: 'Computer Science' },
    { name: 'Ravi Kumar', email: 'ravi@showcase.dev', password: 'student123', department: 'Information Technology' },
  ]);

  await Project.create([
    {
      title: 'CampusCart',
      description: 'A peer-to-peer marketplace where students buy and sell textbooks, lab kits and bikes inside their campus.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      githubUrl: 'https://github.com/example/campuscart',
      liveUrl: 'https://example.com/campuscart',
      student: asha._id,
      featured: true,
    },
    {
      title: 'LabQueue',
      description: 'Virtual queue for shared lab machines with SMS reminders when your slot is next.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'Twilio'],
      githubUrl: 'https://github.com/example/labqueue',
      student: ravi._id,
    },
    {
      title: 'StudyBuddy',
      description: 'Matches students for group study sessions based on subject, schedule and preferred pace.',
      technologies: ['React', 'Firebase'],
      githubUrl: 'https://github.com/example/studybuddy',
      student: asha._id,
    },
    {
      title: 'Attendly',
      description: 'QR-code based attendance tracker with per-subject analytics for faculty.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      githubUrl: 'https://github.com/example/attendly',
      student: ravi._id,
    },
  ]);

  console.log('Seeded. Admin: admin@showcase.dev / admin123 | Student: asha@showcase.dev / student123');
  process.exit(0);
})();
