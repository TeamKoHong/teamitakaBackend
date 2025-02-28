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
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Todo.associate = (models) => {
    Todo.belongsTo(models.Project, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });
  };

  return Todo;
};
