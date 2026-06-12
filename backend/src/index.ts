import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import tableRoutes from './routes/tables';
import floorPlanRoutes from './routes/floorplan';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

import authRoutes from './routes/auth';
import Admin from './models/Admin';
import bcrypt from 'bcryptjs';

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

import path from 'path';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/floorplan', floorPlanRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Smart Ordering System API is running');
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Seed default admin
const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await Admin.create({ username: 'admin', passwordHash });
      console.log('Default admin created (admin / admin123)');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
};

// MongoDB Connection and Server Start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-ordering';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
