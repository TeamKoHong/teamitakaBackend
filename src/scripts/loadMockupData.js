const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

async function loadMockupData() {
  const users = [];
  const profiles = [];
  const projects = [];

  // Users 데이터 준비 및 중복 체크
  await new Promise((resolve, reject) => {
    fs.createReadStream('src/data/users_mockup.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const existingUser = await db.User.findOne({ where: { username: row.username } });
        if (!existingUser) { // 중복 없으면 추가
          users.push({
            user_id: uuidv4(), // CHAR(36).BINARY로 UUID 생성
            username: row.username,
            email: row.email,
            password: row.password,
            userType: row.userType,
            role: row.role,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Profile 데이터 준비 (중복 체크 포함 가능)
  await new Promise((resolve, reject) => {
    fs.createReadStream('src/data/users_mockup.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const existingUser = await db.User.findOne({ where: { username: row.username } });
        if (existingUser) {
          profiles.push({
            user_id: existingUser.user_id, // 기존 User의 user_id 사용
            nickname: row.username,
            profileImageUrl: row.profileImageUrl,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Projects 데이터 준비 (중복 체크 포함 가능)
  await new Promise((resolve, reject) => {
    fs.createReadStream('src/data/projects_mockup.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const existingUser = await db.User.findOne({ where: { username: row.user_id } });
        if (existingUser) {
          projects.push({
            project_id: uuidv4(),
            title: row.title,
            description: row.description,
            user_id: existingUser.user_id, // User의 user_id 사용
            recruitment_id: uuidv4(),
            role: row.role,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Users 삽입
  if (users.length > 0) {
    const createdUsers = await db.User.bulkCreate(users, {
      fields: ['user_id', 'username', 'email', 'password', 'userType', 'role', 'createdAt', 'updatedAt'],
      returning: true,
    });
    console.log('Users loaded');
  } else {
    console.log('No new users to load');
  }

  // Profile 삽입
  if (profiles.length > 0) {
    const createdProfiles = await db.Profile.bulkCreate(profiles, {
      fields: ['user_id', 'nickname', 'profileImageUrl', 'createdAt', 'updatedAt'],
      returning: true,
    });
    console.log('Profiles loaded');
  } else {
    console.log('No new profiles to load');
  }

  // Projects 삽입
  if (projects.length > 0) {
    const createdProjects = await db.Project.bulkCreate(projects, {
      fields: ['project_id', 'title', 'description', 'user_id', 'recruitment_id', 'role', 'createdAt', 'updatedAt'],
      returning: true,
    });
    console.log('Projects loaded');
  } else {
    console.log('No new projects to load');
  }

  process.exit(0);
}

loadMockupData().catch(err => {
  console.error(err);
  process.exit(1);
});