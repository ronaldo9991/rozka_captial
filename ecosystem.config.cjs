module.exports = {
  apps: [{
    name: 'mekness-api',
    script: './dist/index.js',
    cwd: '/root/mekness',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      FRONTEND_URL: 'https://new.mekness.com',
      API_URL: 'https://new.mekness.com/api',
      DATABASE_URL: 'postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway',
      MYFATOORAH_API_KEY: 'yIEC-qPztpBvzvB3LD5VqqO4PmImAbC6yZZ9BgPgzdn8Qmb_pGKH-0KHuAaUvyGKLY0rgwIC1jCE9OkQcdpN4VKqqbcOq7APvbRPHpL7Q8ytlbcP8Ma6Bgv9rfxELVKR-EAS_pQCDz6lnUvRymJEdtd0WNFOpFdQtcluO8n8uVZbOIQBn8zTKCkLIQ-raGd8NQ3isuH-Ttyn4htZrHi1YIdDtqFsLDXO0_0Zyj9SmmZP_WxPmD9pEDMEkMJ3vxHyeuF-Vf4p3zHx44D3T0amfDZTvduR1PDzlER6eN0OcixUAQm3oppt0AurejDgE95iZU81uqOCZaQC1ghs6KsUyuKvXwuLobQDiUnAq9FikwJRNiUH889afkkcK0beat-oLJhDFHNxllSzLmKFV4z_AIAhMXxIkU_15Z0uC9_rfglaJgUhl9EF_xbXqYnh3aLwj60iGaaZPkGs8t5tlq_8F8zTVKGNQVz4CD-6YTdjNCWmDgH0MOX4XtjgfAofSbBJaMOqC8DIymKjsUakHvV1PV6nx4UrEmnB3XrgY4HOgjJtTDLGzIx1GZH3SMBK8cN8MIcfDO8DTJx1pgHV3syp6_Ejvwx28AguLixnm2xDAzyii8hWPWIH6emSzGOlc2YEF7CHgalWG-WG7XrXukDYTRYc4ITFpoYrMQPGwQQqHxPUDAJnBbgba4qyBWVFI0XHvwa-sg',
      MYFATOORAH_COUNTRY_CODE: 'USA',
      MYFATOORAH_TEST_MODE: 'false',
      // MT5 Integration - Live Server (Production)
      // NOTE: Manager 10010 can connect but needs "Add users" permission enabled by MT5 admin
      MT5_ENABLED: 'true',
      MT5_SERVER_IP: '192.109.17.202',
      MT5_SERVER_PORT: '443',
      MT5_SERVER_WEB_LOGIN: '10010',
      MT5_SERVER_WEB_PASSWORD: 'Z!Lk3vDl',
      MT5_GROUP_LIVE: 'real\\Mekness-Standard', // Correct group name from MT5 server
      // MT5 Integration - Demo Server
      MT5_SERVER_IP_DEMO: '192.109.17.202',
      MT5_SERVER_PORT_DEMO: '443',
      MT5_SERVER_WEB_LOGIN_DEMO: '10010',
      MT5_SERVER_WEB_PASSWORD_DEMO: 'Z!Lk3vDl',
      MT5_GROUP_DEMO: 'demo\\Mekness_Demo', // Correct group name from MT5 server
      // Email Configuration (Mailgun)
      SMTP_SERVER: 'smtp.eu.mailgun.org',
      SMTP_PORT: '587',
      SMTP_LOGIN: 'accounts@mg.mekness.com',
      SMTP_PASSWORD: 'i1KlRqiM7pCVvb7',
      SMTP_FROM: 'accounts@mg.mekness.com',
      SMTP_FROM_NAME: 'Mekness'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};

