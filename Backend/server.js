import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import callRoutes from './routes/callRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import testRoutes from './routes/testRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import courseMaterialRoutes from './routes/courseMaterialRoutes.js';
import studentPerformanceRoutes from './routes/studentPerformanceRoutes.js';


dotenv.config();

const app = express();

// Connect to database
await connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);           // For normal users
app.use('/api/super-admin', superAdminRoutes); // For super admin
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/student-performance', studentPerformanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/course-materials', courseMaterialRoutes);

// Error handler — sabse neeche rakho
app.use((err, req, res, next) => {
    console.error('🔴 GLOBAL ERROR:', err);
    console.error('🔴 GLOBAL ERROR MESSAGE:', err.message);
    console.error('🔴 GLOBAL ERROR STACK:', err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 ========================================`);
    console.log(`🚀 SERVER STARTED SUCCESSFULLY!`);
    console.log(`🚀 ========================================`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 Auth API: http://localhost:${PORT}/api/auth/login`);
    console.log(`👑 Super Admin API: http://localhost:${PORT}/api/super-admin/login`);
    console.log(`🚀 ========================================\n`);
});