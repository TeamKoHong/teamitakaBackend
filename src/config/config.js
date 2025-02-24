module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.PORT,
    dialect: "mysql",
    charset: process.env.DB_CHARSET,
    collate: "utf8mb4_bin",
    dialectOptions: {
      charset: "utf8mb4",
    },
  },

  production: {
    username: process.env.GCP_DB_USER,
    password: process.env.GCP_DB_PASSWORD,
    database: process.env.GCP_DB_NAME,
    host: process.env.GCP_DB_HOST,
    port: process.env.GCP_DB_PORT,
    dialect: "mysql",
    charset: process.env.DB_CHARSET,
    collate: "utf8mb4_bin",
    dialectOptions: {
      charset: "utf8mb4",
    },
  },

  // 공통 설정 (Development/Production 모두 사용 가능)
  auth: {
    univcertApiKey: process.env.UNIVCERT_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
  },

  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  },

  // DSN 형식으로 데이터베이스 URL 생성 (필요 시 Sequelize CLI 사용)
  getDatabaseUrl: (env = process.env.NODE_ENV || "development") => {
    const config = module.exports[env];
    if (!config) {
      throw new Error(`Environment ${env} not found in config`);
    }
    if (!config.username || !config.password || !config.host || !config.port || !config.database) {
      throw new Error(`Missing required database config for environment ${env}`);
    }
    return `mysql://${config.username}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}`;
  },
};