module.exports = (sequelize, DataTypes) => {
  const ApplicationPortfolio = sequelize.define(
    "ApplicationPortfolio",
    {
      application_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Applications",
          key: "application_id",
        },
        onDelete: "CASCADE",
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "application_portfolios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // No updatedAt for junction table
    }
  );

  return ApplicationPortfolio;
};
