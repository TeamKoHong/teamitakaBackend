module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define("Hashtag", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    });
  
    return Hashtag;
  };
  