const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
    let connection;
    try {
        console.log('📝 Registration attempt:', req.body);
        
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        connection = await pool.getConnection();

        // Check if user exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.json({
            success: true,
            message: 'Registration successful!',
            user: {
                id: result.insertId,
                name: name,
                email: email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    let connection;
    try {
        console.log('🔐 Login attempt:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password required' });
        }

        connection = await pool.getConnection();

        // Find user
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'medicine-reminder-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;