require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Project, sequelize } = require("../models");

async function loadMockupData() {
  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion for deployment...");

    // 기존 목업 데이터 삭제 (배포 환경에서도 초기화)
    await User.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });
    await Project.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing mockup data for deployment.");

    const users = [];
    const profiles = [];
    const projects = [];

    // Users 데이터 준비
    await new Promise((resolve, reject) => {
      fs.createReadStream("/app/data/users_mockup.csv") // 경로 수정
        .pipe(csv())
        .on("data", (row) => {
          users.push({
            user_id: uuidv4(),
            username: row.username,
            email: row.email,
            password: row.password,
            userType: row.userType || "MEMBER",
            role: row.role || "MEMBER",
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          });
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("🚨 Error reading users_mockup.csv:", error);
          reject(error);
        });
    });

    // Profiles 데이터 준비
    await new Promise((resolve, reject) => {
      fs.createReadStream("/app/data/users_mockup.csv") // 경로 수정
        .pipe(csv())
        .on("data", (row) => {
          const user = users.find(u => u.username === row.username);
          if (user) {
            profiles.push({
              user_id: user.user_id,
              nickname: row.username,
              profileImageUrl: row.profileImageUrl || "",
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          } else {
            console.warn(`🚨 No user found for username: ${row.username} in users_mockup.csv for profiles`);
          }
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("🚨 Error reading users_mockup.csv for profiles:", error);
          reject(error);
        });
    });

    // Projects 데이터 준비
    await new Promise((resolve, reject) => {
      fs.createReadStream("/app/data/projects_mockup.csv") // 경로 수정
        .pipe(csv())
        .on("data", (row) => {
          const user = users.find(u => u.username === row.username);
          if (user) {
            projects.push({
              project_id: uuidv4(),
              title: row.title,
              description: row.description || "",
              user_id: user.user_id,
              recruitment_id: uuidv4(),
              role: row.role || "Developer",
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          } else {
            console.warn(`🚨 No user found for username: ${row.username} in projects_mockup.csv`);
          }
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("🚨 Error reading projects_mockup.csv:", error);
          reject(error);
        });
    });

    // 데이터 삽입
    if (users.length > 0) {
      await User.bulkCreate(users, { transaction });
      console.log("✅ Users mockup data inserted for deployment.");
    }
    if (profiles.length > 0) {
      await Profile.bulkCreate(profiles, { transaction });
      console.log("✅ Profiles mockup data inserted for deployment.");
    }
    if (projects.length > 0) {
      await Project.bulkCreate(projects, { transaction });
      console.log("✅ Projects mockup data inserted for deployment.");
    }

    await transaction.commit();
    console.log("✅ Mockup data insertion completed successfully for deployment!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// 실행
if (require.main === module) {
  loadMockupData().catch((err) => {
    console.error("🚨 Final error in loadMockupData:", err);
    process.exit(1);
  });
}

module.exports = loadMockupData;