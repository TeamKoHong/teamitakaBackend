const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid'); // uuid 패키지 가져오기
const { User } = require('../models');

async function loadMockupData() {
  const users = [];

  // Users 데이터 준비
  await new Promise((resolve, reject) => {
    fs.createReadStream('src/data/users_mockup.csv')
      .pipe(csv())
      .on('data', (row) => {
        users.push({
          uuid: uuidv4(), // uuid 값 생성
          username: row.username,
          email: row.email,
          password: row.password,
          profileImageUrl: row.profileImageUrl,
          userType: row.userType,
          role: row.role,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Users 삽입
  const createdUsers = await User.bulkCreate(users, {
    fields: ['uuid', 'username', 'email', 'password', 'profileImageUrl', 'userType', 'role', 'createdAt', 'updatedAt'],
    returning: true,
  });
  console.log('Users loaded');

  process.exit(0);
}

loadMockupData().catch(err => {
  console.error(err);
  process.exit(1);
});