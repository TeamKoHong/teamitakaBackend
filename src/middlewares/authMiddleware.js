"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("recruitment_hashtags");
    if (tableInfo.hashtag_id.type !== "CHAR(36)") {
      await queryInterface.changeColumn("recruitment_hashtags", "hashtag_id", {
        type: Sequelize.CHAR(36),
        allowNull: false,
      });
    }
    // 외래 키가 이미 존재하는지 확인 후 추가
    try {
      await queryInterface.addConstraint("recruitment_hashtags", {
        fields: ["hashtag_id"],
        type: "foreign key",
        name: "recruitment_hashtags_ibfk_2",
        references: {
          table: "hashtags",
          field: "hashtag_id",
        },
        onDelete: "CASCADE",
      });
    } catch (err) {
      console.log("Foreign key recruitment_hashtags_ibfk_2 already exists or failed, skipping...");
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint("recruitment_hashtags", "recruitment_hashtags_ibfk_2");
    } catch (err) {
      console.log("Constraint recruitment_hashtags_ibfk_2 does not exist, skipping...");
    }
    await queryInterface.changeColumn("recruitment_hashtags", "hashtag_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};