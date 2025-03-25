// migrations/xxxxxx-drop-like-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Likes'); // 삭제할 테이블명
  },
  down: async (queryInterface, Sequelize) => {
    // 복구 시 다시 테이블 생성 (선택사항)
  },
};