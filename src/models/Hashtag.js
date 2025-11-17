module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define("Hashtag", {
      hashtag_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: 'hashtags',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });

    return Hashtag;
  };
  