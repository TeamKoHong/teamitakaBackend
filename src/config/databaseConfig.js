const DEFAULT_DIALECT_BY_ENV = {
  production: "postgres",
  development: "mysql",
  test: "mysql",
};

const pick = (keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
};

const toPort = (value, dialect) => {
  if (value !== undefined && value !== "") {
    return Number(value);
  }
  return dialect === "postgres" ? 5432 : 3306;
};

const toBoolean = (value, fallback) => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const preferredPrefixes = (env) => (
  env === "production" ? ["SUPABASE_DB", "DB"] : ["DB", "SUPABASE_DB"]
);

const envKeys = (prefixes, suffix) => prefixes.map((prefix) => `${prefix}_${suffix}`);

const buildDialectOptions = ({ dialect, env }) => {
  if (dialect === "postgres") {
    const useSsl = toBoolean(process.env.DB_SSL, env === "production");
    if (!useSsl) {
      return {
        connectTimeout: 30000,
        family: 4,
      };
    }
    return {
      ssl: {
        require: true,
        rejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
      },
      connectTimeout: 30000,
      family: 4,
    };
  }

  return {
    charset: process.env.DB_CHARSET || "utf8mb4",
    connectTimeout: 30000,
  };
};

const buildDatabaseConfig = (env = process.env.NODE_ENV || "development") => {
  const prefixes = preferredPrefixes(env);
  const dialect = pick([
    ...envKeys(prefixes, "DIALECT"),
    "DATABASE_DIALECT",
  ]) || DEFAULT_DIALECT_BY_ENV[env] || "mysql";

  const config = {
    username: pick(envKeys(prefixes, "USER")),
    password: pick(envKeys(prefixes, "PASSWORD")),
    database: pick(envKeys(prefixes, "NAME")),
    host: pick(envKeys(prefixes, "HOST")),
    port: toPort(pick(envKeys(prefixes, "PORT")), dialect),
    dialect,
    logging: false,
    dialectOptions: buildDialectOptions({ dialect, env }),
    define: {
      underscored: false,
    },
  };

  if (dialect === "mysql") {
    config.charset = process.env.DB_CHARSET || "utf8mb4";
    config.collate = process.env.DB_COLLATE || "utf8mb4_bin";
  }

  return config;
};

const hasRequiredDatabaseConfig = (config) => Boolean(
  config.host &&
  config.username &&
  config.password &&
  config.database
);

const getDatabaseUrl = (env = process.env.NODE_ENV || "development") => {
  const config = buildDatabaseConfig(env);
  if (!hasRequiredDatabaseConfig(config)) {
    throw new Error(`Missing required database config for environment ${env}`);
  }

  const auth = `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}`;
  return `${config.dialect}://${auth}@${config.host}:${config.port}/${config.database}`;
};

module.exports = {
  buildDatabaseConfig,
  getDatabaseUrl,
  hasRequiredDatabaseConfig,
};
