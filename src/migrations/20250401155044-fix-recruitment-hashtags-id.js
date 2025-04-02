"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("recruitment_hashtags");
    console.log("Current hashtag_id type:", tableInfo.hashtag_id.type);
    if (tableInfo.hashtag_id.type !== "CHAR(36)") {
      console.log("Changing hashtag_id to CHAR(36)...");
      await queryInterface.changeColumn("recruitment_hashtags", "hashtag_id", {
        type: Sequelize.CHAR(36),
        allowNull: false,
      });
      console.log("hashtag_id changed to CHAR(36)");
    }
    console.log("Adding foreign key recruitment_hashtags_ibfk_2...");
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
    console.log("Foreign key added successfully");
  },

  down: async (queryInterface, Sequelize) => {
    console.log("Removing foreign key...");
    await queryInterface.removeConstraint("recruitment_hashtags", "recruitment_hashtags_ibfk_2");
    console.log("Foreign key removed");
    console.log("Changing hashtag_id to INTEGER...");
    await 