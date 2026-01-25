'use strict';

/**
 * Migration: Recruitment Status ENUM 통일
 *
 * 목적: Local MySQL의 recruitments.status ENUM을 Production DB에 맞게 변경
 * - OPEN → ACTIVE
 * - CLOSED (유지)
 * - FILLED (추가)
 *
 * Production PostgreSQL: CHECK constraint ('ACTIVE', 'CLOSED', 'FILLED')
 * Local MySQL: ENUM('OPEN', 'CLOSED') → ENUM('ACTIVE', 'CLOSED', 'FILLED')
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    console.log('🔧 Recruitment status ENUM 업데이트 시작...');
    console.log(`📊 Database dialect: ${dialect}`);

    if (dialect === 'mysql') {
      try {
        // 1. 기존 ENUM 확인
        const [columns] = await queryInterface.sequelize.query(`
          SHOW COLUMNS FROM recruitments WHERE Field = 'status';
        `);

        console.log('📋 기존 status 컬럼 정보:', columns[0]);

        // 2. 기존 데이터 확인
        const [existingData] = await queryInterface.sequelize.query(`
          SELECT status, COUNT(*) as count FROM recruitments GROUP BY status;
        `);

        console.log('📊 기존 status 값 분포:', existingData);

        // 3. 먼저 ENUM에 ACTIVE와 FILLED 추가 (OPEN 유지)
        await queryInterface.sequelize.query(`
          ALTER TABLE recruitments
          MODIFY COLUMN status ENUM('OPEN', 'CLOSED', 'ACTIVE', 'FILLED')
          DEFAULT 'OPEN';
        `);

        console.log('✅ ENUM에 ACTIVE, FILLED 추가 완료');

        // 4. OPEN → ACTIVE 데이터 마이그레이션
        const [updateResult] = await queryInterface.sequelize.query(`
          UPDATE recruitments SET status = 'ACTIVE' WHERE status = 'OPEN';
        `);

        console.log(`✅ 데이터 마이그레이션 완료: ${updateResult.affectedRows}개 레코드`);

        // 5. 이제 OPEN 제거하고 최종 ENUM 설정
        await queryInterface.sequelize.query(`
          ALTER TABLE recruitments
          MODIFY COLUMN status ENUM('ACTIVE', 'CLOSED', 'FILLED')
          DEFAULT 'ACTIVE';
        `);

        console.log('✅ ENUM 컬럼 변경 완료');

        // 6. 변경 결과 확인
        const [updatedColumns] = await queryInterface.sequelize.query(`
          SHOW COLUMNS FROM recruitments WHERE Field = 'status';
        `);

        console.log('📋 업데이트된 status 컬럼 정보:', updatedColumns[0]);
        console.log('🎉 Recruitment status ENUM 마이그레이션 완료!');

      } catch (error) {
        console.error('❌ MySQL ENUM 업데이트 실패:', error.message);
        throw error;
      }

    } else if (dialect === 'postgres') {
      console.log('ℹ️  PostgreSQL은 이미 올바른 constraint를 가지고 있습니다.');
      console.log('ℹ️  Production DB: CHECK (status IN (ACTIVE, CLOSED, FILLED))');
      console.log('✅ PostgreSQL은 변경 불필요');

    } else {
      console.warn(`⚠️  알 수 없는 dialect: ${dialect}, 마이그레이션 건너뛰기`);
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    console.log('🔄 Recruitment status ENUM 롤백 시작...');

    if (dialect === 'mysql') {
      try {
        // 1. ACTIVE → OPEN 데이터 롤백
        const [updateResult] = await queryInterface.sequelize.query(`
          UPDATE recruitments SET status = 'OPEN' WHERE status = 'ACTIVE';
        `);

        console.log(`✅ 데이터 롤백 완료: ${updateResult.affectedRows}개 레코드`);

        // 2. ENUM 컬럼 롤백
        await queryInterface.sequelize.query(`
          ALTER TABLE recruitments
          MODIFY COLUMN status ENUM('OPEN', 'CLOSED')
          DEFAULT 'OPEN';
        `);

        console.log('✅ ENUM 컬럼 롤백 완료');
        console.log('🎉 Recruitment status ENUM 롤백 완료!');

      } catch (error) {
        console.error('❌ MySQL ENUM 롤백 실패:', error.message);
        throw error;
      }

    } else if (dialect === 'postgres') {
      console.log('ℹ️  PostgreSQL은 롤백 불필요');

    } else {
      console.warn(`⚠️  알 수 없는 dialect: ${dialect}, 롤백 건너뛰기`);
    }
  }
};
