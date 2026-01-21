module.exports = (sequelize, DataTypes) => {
  const MeetingNotes = sequelize.define("MeetingNotes", {
    meeting_id: {
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meeting_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "meeting_notes",
    freezeTableName: true,
    timestamps: true,
  });

  return MeetingNotes;
};
