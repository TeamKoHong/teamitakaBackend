const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define(
    'Vote',
    {
      vote_id: {                               // ✅ 올바른 기본 키 컬럼명
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
      tableName: 'Votes',
      freezeTableName: true,
      timestamps: true,
      // ✅ 아래를 통해 id 필드 자동 생성 방지 (선택)
      id: false,
    }
  );

  return Vote;
};
