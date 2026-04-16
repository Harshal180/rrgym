// PM2 ecosystem config — run with: pm2 start ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "gym-api",
            script: "server.js",
            cwd: "/home/ubuntu/gym-app/backend",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
            },
            // Logging
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            error_file: "/home/ubuntu/gym-app/logs/error.log",
            out_file: "/home/ubuntu/gym-app/logs/out.log",
            merge_logs: true,
        },
    ],
};
