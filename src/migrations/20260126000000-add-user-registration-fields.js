'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('📝 User 테이블에 회원가입 필드 추가 시작...');

      const tableDescription = await queryInterface.describeTable('users');

      // name 컬럼 추가 (사용자 실명)
      if (!tableDescription.name) {
        console.log('🔧 name 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'name', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: '사용자 실명'
        });
        console.log('✅ name 컬럼 추가 완료');
      } else {
        console.log('✅ name 컬럼이 이미 존재합니다.');
      }

      // birth_date 컬럼 추가 (생년월일)
      if (!tableDescription.birth_date) {
        console.log('🔧 birth_date 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'birth_date', {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: '생년월일 (YYYY-MM-DD)'
        });
        console.log('✅ birth_date 컬럼 추가 완료');
      } else {
        console.log('✅ birth_date 컬럼이 이미 존재합니다.');
      }

      // gender 컬럼 추가 (성별)
      if (!tableDescription.gender) {
        console.log('🔧 gender 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'gender', {
          type: Sequelize.STRING(10),
          allowNull: true,
          comment: '성별 (male/female)'
        });
        console.log('✅ gender 컬럼 추가 완료');
      } else {
        console.log('✅ gender 컬럼이 이미 존재합니다.');
      }

      // marketing_agreed 컬럼 추가 (마케팅 수신 동의)
      if (!tableDescription.marketing_agreed) {
        console.log('🔧 marketing_agreed 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'marketing_agreed', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '마케팅 수신 동의'
        });
        console.log('✅ marketing_agreed 컬럼 추가 완료');
      } else {
        console.log('✅ marketing_agreed 컬럼이 이미 존재합니다.');
      }

      // third_party_agreed 컬럼 추가 (제3자 제공 동의)
      if (!tableDescription.third_party_agreed) {
        console.log('🔧 third_party_agreed 컬럼 추가 중...');
        await queryInterface.addColumn('users', 'third_party_agreed', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '제3자 제공 동의'
        });
        console.log('✅ third_party_agreed 컬럼 추가 완료');
      } else {
        console.log('✅ third_party_agreed 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 User 회원가입 필드 추가 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ User 회원가입 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 User 테이블 회원가입 필드 롤백 시작...');

      const tableDescription = await queryInterface.describeTable('users');

      if (tableDescription.name) {
        await queryInterface.removeColumn('users', 'name');
        console.log('✅ name 컬럼 제거 완료');
      }

      if (tableDescription.birth_date) {
        await queryInterface.removeColumn('users', 'birth_date');
        console.log('✅ birth_date 컬럼 제거 완료');
      }

      if (tableDescription.gender) {
        await queryInterface.removeColumn('users', 'gender');
        console.log('✅ gender 컬럼 제거 완료');
      }

      if (tableDescription.marketing_agreed) {
        await queryInterface.removeColumn('users', 'marketing_agreed');
        console.log('✅ marketing_agreed 컬럼 제거 완료');
      }

      if (tableDescription.third_party_agreed) {
        await queryInterface.removeColumn('users', 'third_party_agreed');
        console.log('✅ third_party_agreed 컬럼 제거 완료');
      }

      console.log('🎉 회원가입 필드 롤백 완료!');
    } catch (error) {
      console.error('❌ 롤백 실패:', error);
      throw error;
    }
  }
};
