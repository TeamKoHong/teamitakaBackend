// migrations/xxxxxx-create-hashtags-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Hashtags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"), // PostgreSQL에서 UUID 자동 생성
        primaryKey: true,
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // 유니크 제약 조건 추가
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 'Hashtags' 테이블을 삭제
    await queryInterface.dropTable('Hashtags');
  }
};
