# MERN Job Portal

A beginner-friendly MERN job portal with job seeker and employer roles.

## Requirements
- Node.js LTS and npm
- MongoDB local server or MongoDB Atlas
- VS Code

## 1. Backend setup
Open a terminal in `backend`:

```bash
npm install
```

Create `backend/.env` (copy `.env.example`) and set:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```
API runs at http://localhost:5000

## 2. Frontend setup
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```
Open the URL shown by Vite (normally http://localhost:5173).

## 3. Try the app
- Register one account with role `jobseeker`.
- Register another account with role `employer`.
- Log in as employer and post a job.
- Log in as jobseeker and apply to the job.
- The employer can view applications for their jobs.

## Project structure
```text
mern-job-portal/
  backend/
    config/db.js
    middleware/auth.js
    models/
    routes/
    server.js
    .env.example
  frontend/
    src/
      components/
      context/
      pages/
      api.js
      App.jsx
      main.jsx
      styles.css
```

## Important
This is an educational starter project. Before production use, add input validation, rate limiting, email verification, password reset, secure deployment settings, file upload validation/storage, pagination, and automated tests. Do not commit `.env` or real secrets.
