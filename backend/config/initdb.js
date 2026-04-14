const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function initDb() {
    let rootConn;
    try {
        rootConn = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            port: process.env.DB_PORT || 3306,
        });

        const dbName = process.env.DB_NAME || "rr_gym";
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        await rootConn.query(`USE \`${dbName}\``);
        console.log(`✅ Database "${dbName}" ready`);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS members (
                id              INT NOT NULL AUTO_INCREMENT,
                first_name      VARCHAR(50)  DEFAULT NULL,
                last_name       VARCHAR(50)  DEFAULT NULL,
                mobile          VARCHAR(15)  DEFAULT NULL,
                email           VARCHAR(100) NOT NULL,
                image           VARCHAR(255) DEFAULT NULL,
                member_type     ENUM('Member','Trainer') NOT NULL,
                age             INT          DEFAULT NULL,
                height          INT          DEFAULT NULL,
                weight          INT          DEFAULT NULL,
                membership_type VARCHAR(50)  DEFAULT NULL,
                start_date      DATE         DEFAULT NULL,
                end_date        DATE         DEFAULT NULL,
                status          VARCHAR(20)  DEFAULT 'Active',
                otp             VARCHAR(4)   DEFAULT NULL,
                otp_expiry      DATETIME     DEFAULT NULL,
                created_at      TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_mobile (mobile),
                INDEX idx_status   (status),
                INDEX idx_end_date (end_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS membership_plans (
                id               INT NOT NULL AUTO_INCREMENT,
                plan_name        VARCHAR(50)    NOT NULL,
                duration_months  INT            NOT NULL,
                price            DECIMAL(10,2)  NOT NULL,
                offer_price      DECIMAL(10,2)  DEFAULT NULL,
                created_at       TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id         INT  NOT NULL AUTO_INCREMENT,
                member_id  INT  NOT NULL,
                date       DATE NOT NULL,
                in_time    TIME DEFAULT NULL,
                out_time   TIME DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                INDEX idx_date        (date),
                INDEX idx_member_date (member_id, date),
                CONSTRAINT fk_att_member
                    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS membership_notifications (
                id         INT NOT NULL AUTO_INCREMENT,
                member_id  INT NOT NULL,
                type       VARCHAR(50) DEFAULT NULL,
                sent_at    DATE        NOT NULL,
                created_at TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                INDEX idx_sent_at          (sent_at),
                INDEX idx_member_type_sent (member_id, type, sent_at),
                CONSTRAINT fk_notif_member
                    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS existing_members (
                archive_id  INT NOT NULL AUTO_INCREMENT,
                id          INT          DEFAULT NULL,
                first_name  VARCHAR(50)  DEFAULT NULL,
                last_name   VARCHAR(50)  DEFAULT NULL,
                mobile      VARCHAR(100) NOT NULL,
                email       VARCHAR(100) NOT NULL,
                status      ENUM('inactive') DEFAULT NULL,
                end_date    DATE         DEFAULT NULL,
                image       VARCHAR(255) DEFAULT NULL,
                deleted_at  DATE         DEFAULT NULL,
                PRIMARY KEY (archive_id),
                UNIQUE KEY uq_email        (email),
                UNIQUE KEY uq_email_mobile (email, mobile)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // ─── payments table — corrected schema ────────────────────────────────
        // FIX: old schema had wrong columns (amount, offer_price, bill_number).
        //      paymentRoutes.js needs: total_amount, balance_due, payment_type, notes.
        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id             INT NOT NULL AUTO_INCREMENT,
                member_id      INT NOT NULL,
                plan_id        INT           DEFAULT NULL,
                plan_name      VARCHAR(50)   NOT NULL,
                total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
                paid_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
                balance_due    DECIMAL(10,2) NOT NULL DEFAULT 0,
                payment_date   DATE          NOT NULL,
                payment_method VARCHAR(30)   DEFAULT 'Cash',
                payment_type   VARCHAR(20)   DEFAULT 'new',
                notes          TEXT          DEFAULT NULL,
                created_at     TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY fk_pay_member (member_id),
                KEY fk_pay_plan   (plan_id),
                CONSTRAINT fk_pay_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
                CONSTRAINT fk_pay_plan   FOREIGN KEY (plan_id)   REFERENCES membership_plans (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        // ─── Auto-migration for existing databases with old payments schema ───
        // Safe to run on every restart — only ALTERs if the column is missing.
        const addColIfMissing = async (column, alterDDL) => {
            const [rows] = await rootConn.query(
                `SELECT COLUMN_NAME FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME   = 'payments'
                   AND COLUMN_NAME  = ?`,
                [column]
            );
            if (rows.length === 0) {
                await rootConn.query(`ALTER TABLE payments ${alterDDL}`);
                console.log(`✅ payments migration: added column "${column}"`);
            }
        };

        await addColIfMissing(
            "total_amount",
            "ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER plan_name"
        );
        await addColIfMissing(
            "balance_due",
            "ADD COLUMN balance_due DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER paid_amount"
        );
        await addColIfMissing(
            "payment_type",
            "ADD COLUMN payment_type VARCHAR(20) DEFAULT 'new' AFTER payment_method"
        );
        await addColIfMissing(
            "notes",
            "ADD COLUMN notes TEXT DEFAULT NULL AFTER payment_type"
        );

        // Migrate old 'amount' column → total_amount, then drop it
        const [amtCols] = await rootConn.query(
            `SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'payments'
               AND COLUMN_NAME  = 'amount'`
        );
        if (amtCols.length > 0) {
            await rootConn.query(
                `UPDATE payments SET total_amount = amount WHERE total_amount = 0 AND amount > 0`
            );
            try {
                await rootConn.query(`ALTER TABLE payments DROP COLUMN amount`);
                console.log("✅ payments migration: dropped legacy column 'amount'");
            } catch (e) {
                console.warn("⚠️  Could not drop legacy 'amount' column:", e.message);
            }
        }

        // Drop legacy 'offer_price' column if present
        const [offerCols] = await rootConn.query(
            `SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'payments'
               AND COLUMN_NAME  = 'offer_price'`
        );
        if (offerCols.length > 0) {
            try {
                await rootConn.query(`ALTER TABLE payments DROP COLUMN offer_price`);
                console.log("✅ payments migration: dropped legacy column 'offer_price'");
            } catch (e) {
                console.warn("⚠️  Could not drop legacy 'offer_price' column:", e.message);
            }
        }

        // Drop legacy 'bill_number' column if present
        const [billCols] = await rootConn.query(
            `SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'payments'
               AND COLUMN_NAME  = 'bill_number'`
        );
        if (billCols.length > 0) {
            try {
                await rootConn.query(`ALTER TABLE payments DROP COLUMN bill_number`);
                console.log("✅ payments migration: dropped legacy column 'bill_number'");
            } catch (e) {
                console.warn("⚠️  Could not drop legacy 'bill_number' column:", e.message);
            }
        }

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS otp_tokens (
                id         INT NOT NULL AUTO_INCREMENT,
                member_id  INT NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expiry     DATETIME    NOT NULL,
                used       TINYINT(1)  DEFAULT 0,
                created_at TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY fk_otp_member (member_id),
                CONSTRAINT fk_otp_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id          INT NOT NULL AUTO_INCREMENT,
                name        VARCHAR(100) NOT NULL,
                username    VARCHAR(50)  NOT NULL,
                password    VARCHAR(255) NOT NULL,
                role        ENUM('owner','trainer') NOT NULL DEFAULT 'trainer',
                is_active   TINYINT(1)  NOT NULL DEFAULT 1,
                last_login  DATETIME    DEFAULT NULL,
                created_at  TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);

        console.log("✅ All tables ready");

        // Seed default membership plans
        const [planRows] = await rootConn.query("SELECT COUNT(*) AS cnt FROM membership_plans");
        if (planRows[0].cnt === 0) {
            await rootConn.query(`
                INSERT INTO membership_plans (plan_name, duration_months, price) VALUES
                ('1 Month',  1,  1500.00),
                ('3 Months', 3,  2500.00),
                ('6 Months', 6,  4500.00),
                ('1 Year',   12, 8000.00)
            `);
            console.log("✅ Default membership plans seeded");
        }

        // Seed default admin — username: admin | password: Admin@123
        const [adminRows] = await rootConn.query("SELECT COUNT(*) AS cnt FROM admins WHERE username = 'admin'");
        if (adminRows[0].cnt === 0) {
            const hash = await bcrypt.hash("Admin@123", 12);
            await rootConn.query(
                `INSERT INTO admins (name, username, password, role) VALUES ('Gym Owner', 'admin', ?, 'owner')`,
                [hash]
            );
            console.log("✅ Default admin created  →  username: admin  |  password: Admin@123");
            console.log("⚠️  Change the admin password after first login!");
        }

        console.log("✅ Database initialization complete\n");

    } catch (err) {
        console.error("❌ Database initialization failed:", err.message);
        console.error("   Check DB_HOST, DB_USER, DB_PASSWORD in your .env");
        process.exit(1);
    } finally {
        if (rootConn) await rootConn.end();
    }
}

module.exports = initDb;
