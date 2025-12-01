module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define("Todo", {
    todo_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Projects", // 반드시 `Projects` 테이블을 명시
        key: "project_id",
      },
      onDelete: "CASCADE",
    },
    task: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: "todos",
    freezeTableName: true,
    timestamps: true,
  });

  return Todo;
};
