module.exports = (sequelize, DataTypes) => {
  const Timeline = sequelize.define("Timeline", {
    timeline_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Projects",
        key: "project_id",
      },
      onDelete: "CASCADE",
    },
    event_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "Timelines",
    freezeTableName: true,
    timestamps: true,
  });

  return Timeline;
};
  