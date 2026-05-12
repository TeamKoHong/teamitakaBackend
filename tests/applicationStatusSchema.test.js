describe("Application status schema contract", () => {
  test("Application model uses APPROVED instead of legacy ACCEPTED", () => {
    const Application = require("../src/models/Application");
    const sequelize = { define: jest.fn((name, attributes) => attributes) };
    const definition = Application(sequelize, { ENUM: (...values) => ({ values }) });
    const statusValues = definition.status.type.values;

    expect(statusValues).toEqual(["PENDING", "APPROVED", "REJECTED"]);
    expect(statusValues).not.toContain("ACCEPTED");
  });

  test("production migration replaces the legacy ACCEPTED constraint", async () => {
    const migration = require("../src/migrations/20260512000000-fix-application-status-constraint");
    const query = jest.fn().mockResolvedValue([]);
    const transaction = jest.fn(async (callback) => callback("tx"));
    const queryInterface = {
      sequelize: {
        getDialect: () => "postgres",
        query,
        transaction,
      },
    };

    await migration.up(queryInterface);

    const sql = query.mock.calls.map(([statement]) => statement).join("\n");
    const addConstraint = query.mock.calls
      .map(([statement]) => statement)
      .find((statement) => statement.includes("ADD CONSTRAINT applications_status_check"));

    expect(sql).toContain("DROP CONSTRAINT IF EXISTS applications_status_check");
    expect(sql).toContain("UPDATE applications SET status = 'APPROVED' WHERE status = 'ACCEPTED';");
    expect(addConstraint).toContain("'APPROVED'");
    expect(addConstraint).not.toContain("'ACCEPTED'");
    expect(sql.indexOf("DROP CONSTRAINT IF EXISTS applications_status_check")).toBeLessThan(
      sql.indexOf("UPDATE applications SET status = 'APPROVED' WHERE status = 'ACCEPTED';")
    );
    expect(sql.indexOf("UPDATE applications SET status = 'APPROVED' WHERE status = 'ACCEPTED';")).toBeLessThan(
      sql.indexOf("ADD CONSTRAINT applications_status_check")
    );
  });
});
