
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "rr_gym",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;

// Optional: Test connection at startup
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ MySQL Connected Successfully");
        connection.release();
    } catch (error) {
        console.error("❌ MySQL Connection Failed:", error.message);
    }
})();

module.exports = db;
