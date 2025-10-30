const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'medicine_reminder',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };