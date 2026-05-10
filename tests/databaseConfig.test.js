describe("database config", () => {
  const originalEnv = process.env;
  const databaseEnvKeys = [
    "SUPABASE_DB_HOST",
    "SUPABASE_DB_USER",
    "SUPABASE_DB_PASSWORD",
    "SUPABASE_DB_NAME",
    "SUPABASE_DB_PORT",
    "SUPABASE_DB_DIALECT",
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_PORT",
    "DB_DIALECT",
    "DB_SSL",
  ];

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    for (const key of databaseEnvKeys) {
      process.env[key] = "";
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("production runtime and Sequelize CLI share Supabase Postgres settings", () => {
    process.env.SUPABASE_DB_HOST = "db.example.supabase.co";
    process.env.SUPABASE_DB_USER = "postgres";
    process.env.SUPABASE_DB_PASSWORD = "secret";
    process.env.SUPABASE_DB_NAME = "postgres";
    process.env.SUPABASE_DB_PORT = "5432";

    const cliConfig = require("../src/config/config");
    const { buildDatabaseConfig, getDatabaseUrl } = require("../src/config/databaseConfig");

    expect(cliConfig.production).toMatchObject(buildDatabaseConfig("production"));
    expect(cliConfig.production).toMatchObject({
      username: "postgres",
      password: "secret",
      database: "postgres",
      host: "db.example.supabase.co",
      port: 5432,
      dialect: "postgres",
    });
    expect(cliConfig.production.dialectOptions.ssl.require).toBe(true);
    expect(getDatabaseUrl("production")).toBe(
      "postgres://postgres:secret@db.example.supabase.co:5432/postgres"
    );
  });

  test("production accepts DB_* aliases for env.supabase compatibility", () => {
    process.env.DB_HOST = "db.alias.supabase.co";
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "secret";
    process.env.DB_NAME = "postgres";
    process.env.DB_PORT = "5432";
    process.env.DB_DIALECT = "postgres";

    const cliConfig = require("../src/config/config");

    expect(cliConfig.production).toMatchObject({
      username: "postgres",
      password: "secret",
      database: "postgres",
      host: "db.alias.supabase.co",
      port: 5432,
      dialect: "postgres",
    });
  });
});
