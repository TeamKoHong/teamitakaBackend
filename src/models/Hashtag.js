module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define("Hashtag", {
      id: {
        type: DataTypes.UUID,
        defaultValue: sequelize.literal("gen_random_uuid()"),
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
  