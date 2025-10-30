// Database reset script - DANGEROUS! Use with caution
const mysql = require('mysql2/promise');

async function resetDatabase() {
    if (process.env.NODE_ENV !== 'development') {
        console.error('❌ Reset only allowed in development environment');
        return;
    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD || 'password'
    });

    try {
        await connection.execute('DROP DATABASE IF EXISTS medicine_reminder');
        console.log('✅ Database dropped');
        
        // Recreate using setup
        const setup = require('./setup');
        await setup();
        
    } catch (error) {
        console.error('❌ Reset failed:', error.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    console.log('⚠️  This will DELETE ALL DATA! Continue? (yes/no)');
    // Add confirmation logic here
    resetDatabase();
}

module.exports = resetDatabase;