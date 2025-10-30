// Updated setup.js - Handles everything automatically
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    let connection;
    try {
        // Connect to MySQL server (without specifying database)
        const dbConfig = {
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD || 'password', // They'll set this
            multipleStatements: true
        };

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server');

        // Create database if not exists
        await connection.execute('CREATE DATABASE IF NOT EXISTS medicine_reminder');
        console.log('✅ Database created/verified: medicine_reminder');

        // Switch to the database
        await connection.execute('USE medicine_reminder');
        console.log('✅ Using database: medicine_reminder');

        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        await connection.execute(schemaSQL);
        console.log('✅ All tables created successfully');
        
        console.log('🎉 Database setup completed!');
        console.log('📊 Database: medicine_reminder');
        console.log('📋 Tables: users, medicines, medicine_history');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('💡 Troubleshooting:');
        console.log('   - Make sure MySQL is running');
        console.log('   - Check your MySQL password in .env file');
        console.log('   - Try: mysql -u root -p (to test connection)');
    } finally {
        if (connection) await connection.end();
    }
}

module.exports = setupDatabase;