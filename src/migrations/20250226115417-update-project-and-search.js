"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ `UNIQUE`를 유지해야 하므로, 외래 키를 삭제할 필요 없음

      // 🔹 Projects 테이블 수정 (외래 키를 유지한 채, NOT NULL 속성을 확인)
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        {
          type: Sequelize.CHAR(36),
          allowNull: false, // ✅ NOT NULL 유지
          unique: true,     // ✅ UNIQUE 유지
        },
        { transaction }
      );

      // ✅ 외래 키를 유지하므로, 다시 추가할 필요 없음
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ❌ 기존 컬럼 원래대로 복구
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        {
          type: Sequelize.CHAR(36),
          allowNull: false,
          unique: true, // 원래대로 복원
        },
        { transaction }
      );
    });
  },
};
