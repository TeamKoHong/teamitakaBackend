// migrations/20250219140930-add-max-applicants-to-recruitments.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 'Recruitments' 테이블에 'max_applicants' 컬럼 추가
    await queryInterface.addColumn('Recruitments', 'max_applicants', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 기본값은 0으로 설정
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 'Recruitments' 테이블에서 'max_applicants' 컬럼 삭제
    await queryInterface.removeColumn('Recruitments', 'max_applicants');
  },
};
