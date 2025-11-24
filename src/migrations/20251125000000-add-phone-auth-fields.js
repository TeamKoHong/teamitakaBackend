'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('📱 User 테이블에 전화번호 인증 필드 추가 시작...');

      const tableDescription = await queryInterface.describeTable('users');

      // firebase_phone_uid 컬럼 추가
      if (!tableDescription.firebase_phone_uid) {
        console.log('🔧 firebase_phone_uid 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'firebase_phone_uid', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Firebase Phone Auth UID'
        });
        console.log('✅ firebase_phone_uid 컬럼 추가 완료');
      } else {
        console.log('✅ firebase_phone_uid 컬럼이 이미 존재합니다.');
      }

      // phone_number 컬럼 추가
      if (!tableDescription.phone_number) {
        console.log('🔧 phone_number 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'phone_number', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'E.164 형식 전화번호 (예: +821012345678)'
        });
        console.log('✅ phone_number 컬럼 추가 완료');
      } else {
        console.log('✅ phone_number 컬럼이 이미 존재합니다.');
      }

      // phone_verified 컬럼 추가
      if (!tableDescription.phone_verified) {
        console.log('🔧 phone_verified 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'phone_verified', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '전화번호 인증 완료 여부'
        });
        console.log('✅ phone_verified 컬럼 추가 완료');
      } else {
        console.log('✅ phone_verified 컬럼이 이미 존재합니다.');
      }

      // phone_verified_at 컬럼 추가
      if (!tableDescription.phone_verified_at) {
        console.log('🔧 phone_verified_at 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'phone_verified_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: '전화번호 인증 완료 시각'
        });
        console.log('✅ phone_verified_at 컬럼 추가 완료');
      } else {
        console.log('✅ phone_verified_at 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 User 전화번호 인증 필드 추가 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ User 전화번호 인증 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 User 테이블 전화번호 인증 필드 롤백 시작...');

      const tableDescription = await queryInterface.describeTable('users');

      if (tableDescription.firebase_phone_uid) {
        await queryInterface.removeColumn('users', 'firebase_phone_uid');
        console.log('✅ firebase_phone_uid 컬럼 제거 완료');
      }

      if (tableDescription.phone_number) {
        await queryInterface.removeColumn('users', 'phone_number');
        console.log('✅ phone_number 컬럼 제거 완료');
      }

      if (tableDescription.phone_verified) {
        await queryInterface.removeColumn('users', 'phone_verified');
        console.log('✅ phone_verified 컬럼 제거 완료');
      }

      if (tableDescription.phone_verified_at) {
        await queryInterface.removeColumn('users', 'phone_verified_at');
        console.log('✅ phone_verified_at 컬럼 제거 완료');
      }

      console.log('🎉 전화번호 인증 필드 롤백 완료!');
    } catch (error) {
      console.error('❌ 롤백 실패:', error);
      throw error;
    }
  }
};
