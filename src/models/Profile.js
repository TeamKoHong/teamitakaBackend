// models/Profile.js

module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define("Profile", {
      profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      university: {
        type: DataTypes.STRING,
      },
      major1: {
        type: DataTypes.STRING,
      },
      major2: {
        type: DataTypes.STRING,
      },
      skills: {
        type: DataTypes.STRING, // Comma-separated values (e.g., "JavaScript,React,Node.js")
      },
      link: {
        type: DataTypes.STRING,
      },
      awards: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      ability_graph: {
        type: DataTypes.JSON, // Stores abilities like 업무능력, 소통, 성장, 노력, 의지
      },
      strengths: {
        type: DataTypes.TEXT, // Good points
      },
      weaknesses: {
        type: DataTypes.TEXT, // Points to improve
      },
    });
  
    Profile.associate = (models) => {
      Profile.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    };
  
    return Profile;
  };
  