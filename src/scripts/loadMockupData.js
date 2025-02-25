require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const argv = yargs(process.argv.slice(2))
  .option("users", {
    type: "boolean",
    default: false,
    description: "Process users and profiles from users_mockup.csv",
  })
  .option("projects", {
    type: "boolean",
    default: false,
    description: "Process projects from projects_mockup.csv",
  })
  .help()
  .argv;

async function loadMockupData() {
  console.log("Script version: Latest #389"); // 디버깅: 스크립트 버전 확인
  console.log("argv.users:", argv.users); // 디버깅: 플래그 값 확인
  console.log("argv.projects:", argv.projects);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion for deployment...");

    // 기존 데이터 삭제
    await User.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });
    await Project.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing mockup data for deployment.");

    const users = [];
    const profiles = [];
    const projects = [];

    // --users 플래그가 있을 때 사용자와 프로필 데이터 처리
    if (argv.users) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed users CSV row:", row);
            const user = {
              user_id: uuidv4(), // char(36) UUID 생성
              username: row.username,
              email: row.email,
              password: row.password,
              userType: row.userType || "MEMBER",
              role: row.role || "MEMBER",
              createdAt: new Date(row.createdAt || Date.now()), // NOT NULL
              updatedAt: new Date(row.updatedAt || Date.now()), // NOT NULL
            };
            users.push(user);
          })
          .on("end", resolve)
          .on("error", (error) => {
            console.error("🚨 Error reading users_mockup.csv:", error);
            reject(error);
          });
      });

      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed profiles CSV row:", row);
            const user = users.find((u) => u.username === row.username);
            if (user) {
              profiles.push({
                user_id: user.user_id, // NOT NULL
                nickname: row.username,
                profileImageUrl: row.profileImageUrl || "",
                createdAt: new Date(row.createdAt || Date.now()), // NOT NULL
                updatedAt: new Date(row.updatedAt || Date.now()), // NOT NULL
              });
            } else {
              console.warn(
                `🚨 No user found for username: ${row.username} in users_mockup.csv for profiles`
              );
            }
          })
          .on("end", resolve)
          .on("error", (error) => {
            console.error("🚨 Error reading users_mockup.csv for profiles:", error);
            reject(error);
          });
      });

      if (users.length > 0) {
        await User.bulkCreate(users, { transaction });
        console.log("✅ Users mockup data inserted for deployment.");
      }
      if (profiles.length > 0) {
        await Profile.bulkCreate(profiles, { transaction });
        console.log("✅ Profiles mockup data inserted for deployment.");
      }
    }

    // --projects 플래그가 있을 때만 프로젝트 데이터 처리
    if (argv.projects) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row, index) => {
            console.log(`Parsed projects CSV row (line ${index + 2}):`, row);

            // 필수 필드 검증: title, description, recruitment_id, username
            if (!row.title) {
              throw new Error(`Missing 'title' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`);
            }
            if (!row.description) {
              throw new Error(`Missing 'description' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`);
            }
            if (!row.recruitment_id) {
              throw new Error(`Missing 'recruitment_id' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`);
            }
            if (!row.username) {
              throw new Error(`Missing 'username' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`);
            }

            // username을 통해 user_id 매핑
            const user = users.find((u) => u.username === row.username);
            if (!user) {
              throw new Error(`No user found for username '${row.username}' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`);
            }

            const project = {
              project_id: row.project_id || uuidv4(), // char(36), NOT NULL
              title: row.title.trim(), // varchar(255), NOT NULL
              description: row.description.trim(), // text, NOT NULL
              user_id: user.user_id, // char(36), NOT NULL, 외래 키 참조
              recruitment_id: row.recruitment_id.trim(), // char(36), NOT NULL, Unique
              role: row.role ? row.role.trim() : null, // varchar(255), NULL 허용
              createdAt: new Date(row.createdAt || Date.now()), // datetime, NOT NULL
              updatedAt: new Date(row.updatedAt || Date.now()), // datetime, NOT NULL
            };
            projects.push(project);
          })
          .on("end", () => {
            console.log("Projects prepared:", projects);
            resolve();
          })
          .on("error", (error) => {
            console.error("🚨 Error reading projects_mockup.csv:", error);
            reject(error);
          });
      });

      if (projects.length > 0) {
        await Project.bulkCreate(projects, { transaction });
        console.log("✅ Projects mockup data inserted for deployment.");
      }
    }

    // 최소 하나의 플래그가 제공되었는지 확인
    if (!argv.users && !argv.projects) {
      console.error("🚨 Please specify --users or --projects to process data");
      process.exit(1);
    }

    // 트랜잭션 커밋
    await transaction.commit();
    console.log("✅ Mockup data insertion completed successfully for deployment!");
  } catch (error) {
    // 에러 발생 시 트랜잭션 롤백
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error.stack); // 상세 에러 출력
    process.exit(1);
  } finally {
    // 데이터베이스 연결 종료
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// 직접 실행 시 함수 호출
if (require.main === module) {
  loadMockupData().catch((err) => {
    console.error("🚨 Final error in loadMockupData:", err.stack); // 상세 에러 출력
    process.exit(1);
  });
}

module.exports = { loadMockupData };