const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const router = express.Router();

// Verify token middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, 'medicine-reminder-secret-key', (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get all medicines for user
router.get('/', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [medicines] = await connection.execute(
            'SELECT * FROM medicines WHERE user_id = ? ORDER BY time',
            [req.user.userId]
        );

        res.json({
            success: true,
            medicines: medicines
        });

    } catch (error) {
        console.error('Get medicines error:', error);
        res.json({ success: false, message: 'Failed to fetch medicines' });
    } finally {
        if (connection) connection.release();
    }
});

// Add medicine
router.post('/', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { name, dosage, frequency, time, stock, refill_alert } = req.body;
        
        connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO medicines (user_id, name, dosage, frequency, time, stock, refill_alert) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, name, dosage, frequency, time, stock || 0, refill_alert || 0]
        );

        res.json({
            success: true,
            message: 'Medicine added successfully!',
            medicine: {
                id: result.insertId,
                name,
                dosage,
                frequency,
                time,
                stock: stock || 0,
                refill_alert: refill_alert || 0
            }
        });

    } catch (error) {
        console.error('Add medicine error:', error);
        res.json({ success: false, message: 'Failed to add medicine' });
    } finally {
        if (connection) connection.release();
    }
});

// Mark medicine as taken
router.put('/:id/taken', authenticateToken, async (req, res) => {
    let connection;
    try {
        const medicineId = req.params.id;
        
        connection = await pool.getConnection();

        // Update medicine
        await connection.execute(
            'UPDATE medicines SET status = "taken", stock = GREATEST(0, stock - 1) WHERE id = ? AND user_id = ?',
            [medicineId, req.user.userId]
        );

        // Add to history
        const [medicine] = await connection.execute(
            'SELECT name, dosage, time FROM medicines WHERE id = ?',
            [medicineId]
        );

        if (medicine.length > 0) {
            await connection.execute(
                `INSERT INTO medicine_history (user_id, medicine_id, medicine_name, dosage, scheduled_time, actual_time, status) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIME(), "taken")`,
                [req.user.userId, medicineId, medicine[0].name, medicine[0].dosage, medicine[0].time]
            );
        }

        res.json({
            success: true,
            message: 'Medicine marked as taken!'
        });

    } catch (error) {
        console.error('Update medicine error:', error);
        res.json({ success: false, message: 'Failed to update medicine' });
    } finally {
        if (connection) connection.release();
    }
});

// Delete medicine
router.delete('/:id', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        await connection.execute(
            'DELETE FROM medicines WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );

        res.json({
            success: true,
            message: 'Medicine deleted successfully!'
        });

    } catch (error) {
        console.error('Delete medicine error:', error);
        res.json({ success: false, message: 'Failed to delete medicine' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;