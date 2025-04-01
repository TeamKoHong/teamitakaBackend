"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("recruitment_hashtags", "hashtag_id", {
      type: Sequelize.CHAR(36),
      allowNull: false,
      references: {
        model: "hashtags",
        key: "hashtag_id", // 'id' -> 'hashtag_id'
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("recruitment_hashtags", "hashtag_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};