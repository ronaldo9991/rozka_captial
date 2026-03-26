/**
 * PM2 config (alternate). Set APP_ROOT and DATABASE_URL in the environment.
 */
module.exports = {
  apps: [{
    name: 'rozka-api',
    script: 'npm',
    args: 'start',
    cwd: process.env.APP_ROOT || '/root/rozka_captial',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DATABASE_URL,
      PORT: process.env.PORT || '5000',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
