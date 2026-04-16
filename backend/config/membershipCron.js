const cron = require("node-cron");
const db = require("./db");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

cron.schedule("0 0 * * *", async () => {
    console.log("Membership lifecycle check started...");

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
        // UPDATE STATUS (EXPIRING SOON)
        await db.query(`
            UPDATE members
            SET status = 'expiring_soon'
            WHERE status = 'Active'
            AND DATEDIFF(DATE(end_date), ?) BETWEEN 0 AND 7
        `, [today]);

        // UPDATE STATUS (INACTIVE)
        await db.query(`
            UPDATE members
            SET status = 'Inactive'
            WHERE DATE(end_date) < ?
            AND status != 'Inactive'
        `, [today]);

        // EXPIRY REMINDERS (7,3,1, today)
        const [expiringMembers] = await db.query(`
            SELECT *, DATEDIFF(DATE(end_date), ?) AS days_left
            FROM members
            WHERE status IN ('Active', 'expiring_soon')
            AND DATEDIFF(DATE(end_date), ?) IN (0,1,3,7)
        `, [today, today]);

        for (const m of expiringMembers) {
            const daysLeft = Number(m.days_left);

            let type = null;
            if (daysLeft === 7) type = "7_day";
            else if (daysLeft === 3) type = "3_day";
            else if (daysLeft === 1) type = "1_day";
            else if (daysLeft === 0) type = "today";

            console.log("Expiring member:", m.first_name, "Days left:", daysLeft, "Type:", type);

            if (!type) continue;

            // Check if reminder already sent
            const [alreadySent] = await db.query(`
                SELECT id FROM membership_notifications
                WHERE member_id = ?
                AND type = ?
                AND DATE(sent_at) = ?
            `, [m.id, type, today]);

            if (alreadySent.length === 0) {
                const message = `Dear ${m.first_name}, your gym membership will expire in next ${daysLeft} day(s). Please renew soon. RR_Gym`;

                try {
                    await sendSMS(m.mobile, message);
                    await sendEmail(m.email, "Membership Expiry Reminder", message);
                    console.log("Expiry reminder sent to:", m.first_name);
                } catch (err) {
                    console.error("Failed to send reminder to:", m.first_name, err);
                }

                await db.query(`
                    INSERT INTO membership_notifications (member_id, type, sent_at)
                    VALUES (?, ?, ?)
                `, [m.id, type, today]);
            }
        }

        // INACTIVE REMINDERS
        const [inactiveMembers] = await db.query(`
            SELECT *, DATEDIFF(?, DATE(end_date)) AS expired_days
            FROM members
            WHERE status = 'Inactive'
        `, [today]);

        for (const m of inactiveMembers) {
            const expiredDays = Number(m.expired_days);
            let type = null;

            if (expiredDays === 1) type = "expired_day";
            else if (expiredDays > 1 && expiredDays % 9 === 0) type = "inactive_reminder";

            console.log("Inactive member:", m.first_name, "Expired days:", expiredDays, "Type:", type);

            if (!type) continue;

            const [alreadySent] = await db.query(`
                SELECT id FROM membership_notifications
                WHERE member_id = ?
                AND type = ?
                AND DATE(sent_at) = ?
            `, [m.id, type, today]);

            if (alreadySent.length === 0) {
                const message = `Dear ${m.first_name}, your gym membership is expired. Please renew today.`;

                try {
                    await sendSMS(m.mobile, message);
                    await sendEmail(m.email, "Membership Expired", message);
                    console.log("Inactive reminder sent to:", m.first_name);
                } catch (err) {
                    console.error("Failed to send inactive reminder to:", m.first_name, err);
                }

                await db.query(`
                    INSERT INTO membership_notifications (member_id, type, sent_at)
                    VALUES (?, ?, ?)
                `, [m.id, type, today]);
            }
        }

        // ARCHIVE AFTER 30 DAYS
        const [archiveMembers] = await db.query(`
            SELECT * FROM members
            WHERE status = 'Inactive'
            AND DATEDIFF(?, DATE(end_date)) >= 30
        `, [today]);

        for (const m of archiveMembers) {
            await db.query(`
                INSERT INTO existing_members
                (id, first_name, last_name, mobile, email, status, end_date, image, deleted_at)
                VALUES (?, ?, ?, ?, ?, 'Inactive', ?, ?, ?)
            `, [
                m.id,
                m.first_name,
                m.last_name,
                m.mobile,
                m.email,
                m.end_date,
                m.image,
                today
            ]);

            await db.query("DELETE FROM members WHERE id = ?", [m.id]);
            console.log("Archived member:", m.first_name);
        }

        console.log("Membership lifecycle check completed.");
    } catch (error) {
        console.error("Cron job failed:", error);
    }
});
