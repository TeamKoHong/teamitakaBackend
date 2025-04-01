"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("recruitment_hashtags", {
      recruitment_id: {
        type: Sequelize.CHAR(36).BINARY, // utf8mb4_bin을 보장
        allowNull: false,
        references: {
          model: "recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      hashtag_id: {
        type: Sequelize.CHAR(36).BINARY, // 일관성을 위해 추가
        allowNull: false,
        references: {
          model: "hashtags",
          key: "hashtag_id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("recruitment_hashtags");
  },
};