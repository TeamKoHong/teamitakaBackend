'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 모든 사용자에게 동일한 비밀번호 해시 생성 (Test1234!)
    const passwordHash = await bcrypt.hash('Test1234!', 10);
    const now = new Date();

    const users = [
      {
        user_id: uuidv4(),
        username: 'testuser1',
        email: 'testuser1@korea.ac.kr',
        password: passwordHash,
        university: '고려대학교',
        major: '컴퓨터학과',
        bio: '안녕하세요! 컴퓨터학과 학생입니다.',
        skills: 'React, Node.js, Python',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser2',
        email: 'testuser2@g.hongik.ac.kr',
        password: passwordHash,
        university: '홍익대학교',
        major: '시각디자인학과',
        bio: '디자인과 개발을 함께 하고 싶습니다.',
        skills: 'Figma, Photoshop, Illustrator',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser3',
        email: 'testuser3@yonsei.ac.kr',
        password: passwordHash,
        university: '연세대학교',
        major: '경영학과',
        bio: '비즈니스와 기술의 융합에 관심이 많습니다.',
        skills: 'Data Analysis, Excel, SQL',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser4',
        email: 'testuser4@snu.ac.kr',
        password: passwordHash,
        university: '서울대학교',
        major: '컴퓨터공학부',
        bio: 'AI와 머신러닝을 공부하고 있습니다.',
        skills: 'Python, TensorFlow, PyTorch',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser5',
        email: 'testuser5@hanyang.ac.kr',
        password: passwordHash,
        university: '한양대학교',
        major: '전자공학부',
        bio: '임베디드 시스템에 관심이 있습니다.',
        skills: 'C, C++, Arduino, Raspberry Pi',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser6',
        email: 'testuser6@kaist.ac.kr',
        password: passwordHash,
        university: 'KAIST',
        major: '전산학부',
        bio: '알고리즘과 자료구조를 좋아합니다.',
        skills: 'Java, C++, Algorithm',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser7',
        email: 'testuser7@skku.edu',
        password: passwordHash,
        university: '성균관대학교',
        major: '소프트웨어학과',
        bio: '백엔드 개발자를 목표로 하고 있습니다.',
        skills: 'Java, Spring Boot, MySQL',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser8',
        email: 'testuser8@postech.ac.kr',
        password: passwordHash,
        university: 'POSTECH',
        major: '산업경영공학과',
        bio: '데이터 기반 의사결정에 관심이 있습니다.',
        skills: 'R, Python, Tableau',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser9',
        email: 'testuser9@korea.ac.kr',
        password: passwordHash,
        university: '고려대학교',
        major: '심리학과',
        bio: 'UX 리서치와 사용자 경험에 관심이 많습니다.',
        skills: 'User Research, Survey Design',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: uuidv4(),
        username: 'testuser10',
        email: 'testuser10@g.hongik.ac.kr',
        password: passwordHash,
        university: '홍익대학교',
        major: '게임학부',
        bio: '게임 개발과 Unity를 공부 중입니다.',
        skills: 'Unity, C#, Blender',
        email_verified_at: now,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('users', users, {});

    console.log(`✅ ${users.length}명의 테스트 사용자 생성 완료`);
    console.log('📧 이메일: testuser1-10@{university domain}');
    console.log('👤 사용자명: testuser1-10');
    console.log('🔑 비밀번호: Test1234!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.like]: 'testuser%'
      }
    }, {});

    console.log('🗑️ 테스트 사용자 데이터 삭제 완료');
  }
};
