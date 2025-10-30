const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678', // CHANGE THIS!
    database: 'medicine_reminder',
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