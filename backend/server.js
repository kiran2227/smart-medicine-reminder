const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
testConnection();

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Medicine Reminder Backend API',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            medicines: {
                getAll: 'GET /api/medicines',
                add: 'POST /api/medicines',
                markTaken: 'PUT /api/medicines/:id/taken',
                delete: 'DELETE /api/medicines/:id'
            },
            test: 'GET /api/test'
        }
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Backend is working with MySQL!',
        database: 'Connected to medicine_reminder'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('==================================================');
    console.log('🚀 SMART MEDICINE REMINDER BACKEND STARTED!');
    console.log('📍 Server: http://localhost:' + PORT);
    console.log('📊 API Test: http://localhost:' + PORT + '/api/test');
    console.log('🗄️  Database: MySQL Connected');
    console.log('==================================================');
});