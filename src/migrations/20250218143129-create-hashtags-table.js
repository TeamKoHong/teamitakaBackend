"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 해시태그 테이블 생성
    await queryInterface.createTable("hashtags", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // 중복 방지
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 모집공고와 해시태그의 다대다 관계 테이블 생성
    await queryInterface.createTable("recruitment_hashtags", {
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "recruitments", key: "recruitment_id" },
        onDelete: "CASCADE",
      },
      hashtag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "hashtags", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("recruitment_hashtags");
    await queryInterface.dropTable("hashtags");
  },
};
