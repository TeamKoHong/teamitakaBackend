'use strict';

const APPROVED_STATUSES = "'PENDING', 'APPROVED', 'REJECTED'";
const LEGACY_STATUSES = "'PENDING', 'ACCEPTED', 'REJECTED'";

const run = (queryInterface, sql, transaction) =>
  queryInterface.sequelize.query(sql, { transaction });

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await run(
          queryInterface,
          'ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;',
          transaction,
        );
        await run(
          queryInterface,
          "UPDATE applications SET status = 'APPROVED' WHERE status = 'ACCEPTED';",
          transaction,
        );
        await run(
          queryInterface,
          "ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'PENDING';",
          transaction,
        );
        await run(
          queryInterface,
          `ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN (${APPROVED_STATUSES}));`,
          transaction,
        );
      });
      return;
    }

    if (dialect === 'mysql') {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await run(
          queryInterface,
          "ALTER TABLE applications MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING';",
          transaction,
        );
        await run(
          queryInterface,
          "UPDATE applications SET status = 'APPROVED' WHERE status = 'ACCEPTED';",
          transaction,
        );
        await run(
          queryInterface,
          "ALTER TABLE applications MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING';",
          transaction,
        );
      });
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await run(
          queryInterface,
          "UPDATE applications SET status = 'ACCEPTED' WHERE status = 'APPROVED';",
          transaction,
        );
        await run(
          queryInterface,
          'ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;',
          transaction,
        );
        await run(
          queryInterface,
          "ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'PENDING';",
          transaction,
        );
        await run(
          queryInterface,
          `ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN (${LEGACY_STATUSES}));`,
          transaction,
        );
      });
      return;
    }

    if (dialect === 'mysql') {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await run(
          queryInterface,
          "ALTER TABLE applications MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING';",
          transaction,
        );
        await run(
          queryInterface,
          "UPDATE applications SET status = 'ACCEPTED' WHERE status = 'APPROVED';",
          transaction,
        );
        await run(
          queryInterface,
          "ALTER TABLE applications MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING';",
          transaction,
        );
      });
    }
  },
};
