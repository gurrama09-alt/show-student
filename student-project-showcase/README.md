# Student Project Showcase (MERN)

Students sign up, publish their projects (title, description, technologies, GitHub/live URL), and anyone can browse and search them. Admins moderate content.

## Stack
- **MongoDB + Mongoose**: users and projects
- **Express + Node.js**: REST API, JWT authentication, role-based access
- **React (Vite)**: UI with React Router and a context-based auth store

## Run it

Prerequisites: Node 18+ and MongoDB running locally (or an Atlas URI).

```bash
# 1. API
cd server
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed        # optional demo data
npm run dev         # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev         # http://localhost:5173
```

Demo logins after seeding:
- Admin: `admin@showcase.dev` / `admin123`
- Student: `asha@showcase.dev` / `student123`

## Roles

| Capability | Guest | Student | Admin |
|---|:-:|:-:|:-:|
| Browse, search, filter, view projects | yes | yes | yes |
| Publish a project | | yes | yes |
| Edit / delete own project | | yes | yes |
| Edit / delete any project | | | yes |
| Hide, publish, feature projects | | | yes |
| View and delete student accounts | | | yes |

Registration always creates a `student`. Admins are created through the seed script (or by changing `role` in MongoDB).

## API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create student account |
| POST | `/api/auth/login` | public | Log in, returns JWT |
| GET / PUT | `/api/auth/me` | user | Current profile / update profile |
| GET | `/api/projects?q=&tech=&page=&limit=` | public | List published projects (search, filter, paginate) |
| GET | `/api/projects/meta/technologies` | public | Distinct technologies for the filter |
| GET | `/api/projects/:id` | public* | Project details (*hidden ones: owner/admin only) |
| GET | `/api/projects/mine` | user | Own projects |
| POST | `/api/projects` | user | Create project |
| PUT | `/api/projects/:id` | owner/admin | Update project |
| DELETE | `/api/projects/:id` | owner/admin | Delete project |
| GET | `/api/projects/admin/all` | admin | All projects, any status |
| PATCH | `/api/projects/:id/moderate` | admin | Set `status` (published/hidden), `featured` |
| GET | `/api/users` | admin | Users with project counts |
| DELETE | `/api/users/:id` | admin | Delete user and their projects |

## Structure
```
server/  config, models (User, Project), middleware (auth, roles), routes, seed.js
client/  src/{api.js, AuthContext.jsx, App.jsx, components, pages, styles.css}
```

## Ideas to extend
Image upload for screenshots (Multer + Cloudinary), likes or comments, pagination on the admin tables, password reset by email.
