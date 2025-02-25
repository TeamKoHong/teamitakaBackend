require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs"); // yargs 설치 필요: npm install yargs

const argv = yargs(process.argv.slice(2))
  .option("users", {
    type: "boolean",
    default: false,
    description: "Process users and profiles from users_mockup.csv"
  })
  .option("projects", {
    type: "boolean",
    default: false,
    description: "Process projects from projects_mockup.csv"
  })
  .help()
  .argv;

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

    if (argv.users) {
      // Users 데이터 준비
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
          .pipe(csv())
          .on("data", (row) => {
            const user = {
              user_id: uuidv4(),
              username: row.username,
              email: row.email,
              password: row.password,
              userType: row.userType || "MEMBER",
              role: row.role || "MEMBER",
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            };
            users.push(user);
          })
          .on("end", resolve)
          .on("error", (error) => {
            console.error("🚨 Error reading users_mockup.csv:", error);
            reject(error);
          });
      });

      // Profiles 데이터 준비
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
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

      // Users와 Profiles 삽입
      if (users.length > 0) {
        await User.bulkCreate(users, { transaction });
        console.log("✅ Users mockup data inserted for deployment.");
      }
      if (profiles.length > 0) {
        await Profile.bulkCreate(profiles, { transaction });
        console.log("✅ Profiles mockup data inserted for deployment.");
      }
    }

    if (argv.projects) {
      // Projects 데이터 준비 (Users 데이터 기반)
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv())
          .on("data", (row) => {
            console.log("Processing row from projects_mockup.csv:", row); // 디버깅 추가
            const user = users.find(u => u.username === row.username);
            if (user) {
              projects.push({
                project_id: uuidv4(),
                title: row.title || "Default Project", // 기본값 추가
                description: row.description || "",    // 기본값 추가
                user_id: user.user_id,
                recruitment_id: row.recruitment_id || uuidv4(), // CSV 또는 UUID
                role: row.role || "Developer",         // 기본값 추가
                createdAt: new Date(row.createdAt || new Date()), // 기본값 추가
                updatedAt: new Date(row.updatedAt || new Date()), // 기본값 추가
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
    
      // Projects 삽입
      if (projects.length > 0) {
        await Project.bulkCreate(projects, { transaction });
        console.log("✅ Projects mockup data inserted for deployment.");
      }
    }

    if (!argv.users && !argv.projects) {
      console.error("🚨 Please specify --users or --projects to process data");
      process.exit(1);
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