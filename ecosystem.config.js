module.exports = {
  apps: [{
    name: 'mekness-api',
    script: 'npm',
    args: 'start',
    cwd: '/root/mekness',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://cabinet:%289%3A%21eg%23-7Nd1@localhost:3306/cabinet',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

