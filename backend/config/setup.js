require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

function setupDatabase() {
    // Create connection without database
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true  // This allows multiple SQL statements
    });

    console.log('📦 Setting up database...');

    connection.connect((err) => {
        if (err) {
            console.error('❌ Connection failed:', err.message);
            process.exit(1);
        }

        console.log('✅ Connected to MySQL');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute all SQL statements
        connection.query(schema, (err, results) => {
            if (err) {
                console.error('❌ Database setup failed:', err.message);
                connection.end();
                process.exit(1);
            }

            console.log('✅ Database and tables created successfully');
            console.log('🎉 Database setup completed!');
            connection.end();
            process.exit(0);
        });
    });
}

setupDatabase();