const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define(
    'Vote',
    {
      vote_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'project_id',
        },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'votes',  // PostgreSQL 실제 테이블명 (lowercase)
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Vote;
};