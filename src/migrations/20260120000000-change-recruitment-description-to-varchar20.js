'use strict';

/**
 * Migration: Recruitment description 필드 타입 변경
 *
 * 목적: description 필드를 TEXT에서 VARCHAR(20)으로 변경
 * - 프로젝트 정보 입력을 최대 20자로 제한
 *
 * 주의: 기존 데이터 중 20자를 초과하는 description이 있으면 마이그레이션 실패할 수 있음
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    console.log('Recruitment description 필드 타입 변경 시작...');
    console.log(`Database dialect: ${dialect}`);

    try {
      // 기존 데이터 중 20자 초과 데이터 확인
      const [longDescriptions] = await queryInterface.sequelize.query(`
        SELECT recruitment_id, description, LENGTH(description) as len
        FROM recruitments
        WHERE LENGTH(description) > 20;
      `);

      if (longDescriptions.length > 0) {
        console.log('20자 초과 데이터 발견:', longDescriptions);

        // 20자로 자르기
        for (const row of longDescriptions) {
          const truncated = row.description.substring(0, 20);
          await queryInterface.sequelize.query(`
            UPDATE recruitments
            SET description = ?
            WHERE recruitment_id = ?;
          `, {
            replacements: [truncated, row.recruitment_id]
          });
        }
        console.log('20자 초과 데이터 truncate 완료');
      }

      if (dialect === 'mysql') {
        await queryInterface.sequelize.query(`
          ALTER TABLE recruitments
          MODIFY COLUMN description VARCHAR(20) NOT NULL DEFAULT 'No description';
        `);
      } else if (dialect === 'postgres') {
        await queryInterface.changeColumn('recruitments', 'description', {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'No description'
        });
      }

      console.log('description 필드 타입 변경 완료 (VARCHAR(20))');

    } catch (error) {
      console.error('마이그레이션 실패:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    console.log('Recruitment description 필드 타입 롤백 시작...');

    try {
      if (dialect === 'mysql') {
        await queryInterface.sequelize.query(`
          ALTER TABLE recruitments
          MODIFY COLUMN description TEXT NOT NULL;
        `);
      } else if (dialect === 'postgres') {
        await queryInterface.changeColumn('recruitments', 'description', {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: 'No description provided'
        });
      }

      console.log('description 필드 타입 롤백 완료 (TEXT)');

    } catch (error) {
      console.error('롤백 실패:', error.message);
      throw error;
    }
  }
};
