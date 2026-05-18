require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Establish database connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For local development, allow all. In production, configure explicitly.
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Base Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

const path = require('path');

// Serve Frontend in Production mode
if (process.env.NODE_ENV === 'production') {
  // Set static build folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Point all non-API GET requests to the index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // Welcome/Status endpoint in development
  app.get('/', (req, res) => {
    res.json({ message: '🛰️ Synapse Task Manager API is running smoothly in development' });
  });
}

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server launched in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
