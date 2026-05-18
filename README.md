# 🌌 Synapse | Collaborative MERN Team Task Manager

Synapse is a high-performance, premium, collaborative task management platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS v4. It features role-based access controls, interactive Kanban workspace board, search capabilities, real-time analytics, real-time email onboarding notifications, and official Google Sign-In authentication.

![Stack](https://img.shields.io/badge/Stack-MERN-blueviolet?style=for-the-badge)
![UI Style](https://img.shields.io/badge/Styling-Tailwind_v4-indigo?style=for-the-badge)
![Auth Mode](https://img.shields.io/badge/Auth-Google_&_JWT-teal?style=for-the-badge)
![Notifications](https://img.shields.io/badge/Emails-Nodemailer_SMTP-blue?style=for-the-badge)
![Deploy ready](https://img.shields.io/badge/Deploy-Railway_Ready-black?style=for-the-badge)

---

## ✨ Core Features

### 🔐 1. Dual Mode Authentication (Google + Standard)
- **Official Google OAuth 2.0:** Secure login/register with one-click Google Sign-In.
- **Smart Development Emulator:** Bypasses environment configurations in local development, allowing team members to test Google registration and MongoDB state updates instantly without setting up Google developer credentials.
- **Standard Authentication:** JWT signed cookies/headers and bcrypt password hashing.

### 📧 2. Real-time Nodemailer Team Onboarding
- Asymmetric background email dispatcher: sends beautiful responsive HTML dark-mode workspace invitations to the colleague's inbox immediately when they are invited.
- Zero-lag design: Email dispatch occurs in a non-blocking background thread, preserving instant API responses.

### 📋 3. Interactive Kanban Board (`/projects/:id`)
- Three status lists columns representing task milestones: **Todo**, **In Development**, and **Completed**.
- Real-time queries: Search by keywords, and filter cards by priority ratings (**Low**, **Medium**, **High**).
- Overdue tasks highlighted with glowing red warning borders.

### 🎭 4. Role-based Security Bounds
- **Admins** hold complete authority to create tasks, assign colleagues, update task details (title, priority, due date), delete cards, invite coworkers, or remove users.
- **Members** can view the project board details, but can *only* update the status dropdown on tasks *assigned specifically to them*.

### 📊 5. Synapse Analytics Dashboard
- Aggregated counts tracking: Total, Completed, Pending, and Overdue tasks.
- Circular SVG progress meter visualizing workspace completion efficiency.
- Dynamic queue listing all active assignments allocated to the logged-in profile.
- Real-time project progress bars.

---

## 🚀 Local Installation & Setup Guide

Ensure you have **Node.js (v18+)** and **MongoDB** installed locally before proceeding.

### 📡 1. Configure the Backend API Server
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Setup your environment variable `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.jmfvlnh.mongodb.net/
   JWT_SECRET=supersecretkey123_synapse_secure_key_3901

   # SMTP Email Configuration (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email-address@gmail.com
   SMTP_PASSWORD=your-gmail-app-password
   SMTP_FROM="Synapse Workspace <your-email-address@gmail.com>"

   # Google Sign-In Credentials (Official)
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```
3. Boot the development server (uses `nodemon` with hot-reloading for `.js`, `.json`, and `.env` file changes!):
   ```bash
   npm run dev
   ```

### 💻 2. Configure the React Frontend App
1. Navigate into the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Setup your environment variable `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```
3. Fire up the local Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend boots on `http://localhost:5173`. Open this URL in your web browser.*

---

## 🔑 Generating Google Client ID (Official)
To replace the simulation mode with active, real-world Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a project workspace.
3. Search for **OAuth consent screen**. Set user type to **External**, enter your application support details, and save.
4. Navigate to **Credentials** -> Click **+ Create Credentials** -> Choose **OAuth client ID**.
5. Set Application Type to **Web application**.
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
7. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173`
8. Click **Create** to receive your `Client ID`! Paste it into both your `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).
