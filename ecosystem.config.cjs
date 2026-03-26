/**
 * PM2 config for Rozka Capitals production.
 * Set secrets and URLs in the shell environment (or a .env loaded before `pm2 start`).
 * Do not commit real credentials.
 */
const appRoot = process.env.APP_ROOT || '/root/rozka_captial';

module.exports = {
  apps: [{
    name: 'rozka-api',
    script: './dist/index.js',
    cwd: appRoot,
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || '5000',
      FRONTEND_URL: process.env.FRONTEND_URL || 'https://rozkacapitals.com',
      API_URL: process.env.API_URL || 'https://rozkacapitals.com/api',
      DATABASE_URL: process.env.DATABASE_URL,
      MYFATOORAH_API_KEY: process.env.MYFATOORAH_API_KEY,
      MYFATOORAH_COUNTRY_CODE: process.env.MYFATOORAH_COUNTRY_CODE,
      MYFATOORAH_TEST_MODE: process.env.MYFATOORAH_TEST_MODE,
      MT5_ENABLED: process.env.MT5_ENABLED,
      MT5_SERVER_IP: process.env.MT5_SERVER_IP,
      MT5_SERVER_PORT: process.env.MT5_SERVER_PORT,
      MT5_SERVER_WEB_LOGIN: process.env.MT5_SERVER_WEB_LOGIN,
      MT5_SERVER_WEB_PASSWORD: process.env.MT5_SERVER_WEB_PASSWORD,
      MT5_GROUP_LIVE: process.env.MT5_GROUP_LIVE,
      MT5_SERVER_IP_DEMO: process.env.MT5_SERVER_IP_DEMO,
      MT5_SERVER_PORT_DEMO: process.env.MT5_SERVER_PORT_DEMO,
      MT5_SERVER_WEB_LOGIN_DEMO: process.env.MT5_SERVER_WEB_LOGIN_DEMO,
      MT5_SERVER_WEB_PASSWORD_DEMO: process.env.MT5_SERVER_WEB_PASSWORD_DEMO,
      MT5_GROUP_DEMO: process.env.MT5_GROUP_DEMO,
      SMTP_SERVER: process.env.SMTP_SERVER,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_LOGIN: process.env.SMTP_LOGIN,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      SMTP_FROM: process.env.SMTP_FROM,
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Rozka Capitals',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],
};
