require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Establish database connection
connectDB();

const app = express();

// Middlewares
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Base Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

const path = require('path');
const fs = require('fs');

// Serve Frontend in Production mode if built locally
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  // Set static build folder
  app.use(express.static(frontendDistPath));

  // Point all non-API GET requests to the index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  // Welcome/Status endpoint in development or if frontend dist doesn't exist
  app.get('/', (req, res) => {
    res.json({ message: '🛰️ Synapse Task Manager API is running smoothly' });
  });
}

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server launched in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
