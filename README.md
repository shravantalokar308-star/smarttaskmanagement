# Synapse - Collaborative Team Task Manager

Synapse is a web-based collaborative task management tool that helps teams organize their work using a visual board (Kanban style). It is built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## What you can do with Synapse

- Manage Tasks Visually: See all your team's tasks on a clean Kanban board divided into 'Todo', 'In Development', and 'Completed'.
- Role-based Access:
  - Admins can create, assign, edit, and delete tasks, and invite or remove team members.
  - Members can view the project board and update the status of tasks that are assigned specifically to them.
- Two Login Options: Sign in using a standard email and password or use your Google account.
- Real-time Email Invites: When you invite team members, they get an email invitation instantly to join the workspace.
- Dashboard Analytics: Get a quick overview of total, completed, pending, and overdue tasks with simple visual meters.


---

## How to Set It Up Locally

You will need Node.js (version 18 or higher) and MongoDB installed on your computer.

### 1. Set up the Backend
1. Go into the backend directory:
   ```bash
   cd backend
   ```
2. Create a file named `.env` in the backend folder and add these settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=some_random_secret_key

   # Email setup (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email-address@gmail.com
   SMTP_PASSWORD=your-gmail-app-password
   SMTP_FROM="Synapse Workspace <your-email-address@gmail.com>"

   # Google Sign-In (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Set up the Frontend
1. Go into the frontend directory:
   ```bash
   cd frontend
   ```
2. Create a file named `.env` in the frontend folder and add these settings:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```
   Now open your browser and go to `http://localhost:5173`.

---

## Setting up Google Sign-In (Optional)
If you want to use the official Google Sign-In, follow these quick steps:
1. Go to the Google Cloud Console.
2. Create a project and set up the OAuth Consent Screen.
3. Under Credentials, create an OAuth 2.0 Client ID.
4. Set the application type to "Web application".
5. Add `http://localhost:5173` to both "Authorized JavaScript origins" and "Authorized redirect URIs".
6. Copy the Client ID and paste it into both the frontend and backend `.env` files.

