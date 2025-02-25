require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Recruitment, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const argv = yargs(process.argv.slice(2))
  .option("users", {
    type: "boolean",
    default: false,
    description: "Process users and profiles from users_mockup.csv",
  })
  .option("recruitments", {
    type: "boolean",
    default: false,
    description: "Process recruitments from recruitment_mockup.csv",
  })
  .option("projects", {
    type: "boolean",
    default: false,
    description: "Process projects from projects_mockup.csv",
  })
  .help()
  .argv;

async function loadMockupData() {
  console.log("Script version: Latest #394"); // 디버깅: 스크립트 버전 확인
  console.log("argv.users:", argv.users); // 디버깅: 플래그 값 확인
  console.log("argv.recruitments:", argv.recruitments);
  console.log("argv.projects:", argv.projects);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion for deployment...");

    // 기존 데이터 삭제는 주석 처리 (CI에서 데이터 유지 필요)
    // await User.destroy({ where: {}, transaction });
    // await Profile.destroy({ where: {}, transaction });
    // await Recruitment.destroy({ where: {}, transaction });
    // await Project.destroy({ where: {}, transaction });
    // console.log("✅ Cleared existing mockup data for deployment.");

    const users = [];
    const profiles = [];
    const recruitments = [];
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

    // --recruitments 플래그가 있을 때 리크루트먼트 데이터 처리
    if (argv.recruitments) {
      if (!argv.users) {
        throw new Error("🚨 Recruitments data insertion requires users data. Please use --users flag first.");
      }
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/recruitment_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row, index) => {
            console.log(`Parsed recruitments CSV row (line ${index + 2}):`, row);

            if (!row.title) throw new Error(`Missing 'title' in CSV row (line ${index + 2})`);
            if (!row.description) throw new Error(`Missing 'description' in CSV row (line ${index + 2})`);
            if (!row.username) throw new Error(`Missing 'username' in CSV row (line ${index + 2})`);

            const user = users.find((u) => u.username === row.username);
            if (!user) throw new Error(`No user found for username '${row.username}'`);

            const recruitment = {
              recruitment_id: row.recruitment_id || uuidv4(), // char(36), NOT NULL
              title: row.title.trim(), // STRING, NOT NULL
              description: row.description.trim(), // TEXT, NOT NULL
              status: row.status || "OPEN", // ENUM, 기본값 OPEN
              user_id: user.user_id, // char(36), NOT NULL, 외래 키 참조
              photo: row.photo || null, // STRING, NULL 허용
              createdAt: new Date(row.createdAt || Date.now()), // DATE, NOT NULL
              updatedAt: new Date(row.updatedAt || Date.now()), // DATE, NOT NULL
            };
            recruitments.push(recruitment);
          })
          .on("end", () => {
            console.log("Recruitments prepared:", recruitments);
            resolve();
          })
          .on("error", (error) => {
            console.error("🚨 Error reading recruitment_mockup.csv:", error);
            reject(error);
          });
      });

      if (recruitments.length > 0) {
        await Recruitment.bulkCreate(recruitments, { transaction });
        console.log("✅ Recruitments mockup data inserted for deployment.");
      }
    }

    // --projects 플래그가 있을 때 프로젝트 데이터 처리
    if (argv.projects) {
      const projects = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed projects CSV row:", row);
            if (!row.title || !row.description) {
              throw new Error(`Missing required fields in projects CSV: ${JSON.stringify(row)}`);
            }
            const user = users.find((u) => u.username === row.username);
            if (!user) throw new Error(`No user found for username '${row.username}'`);
            projects.push({
              project_id: uuidv4(),
              title: row.title,
              description: row.description,
              user_id: user.user_id,
              recruitment_id: row.recruitment_id || null,
              role: row.role || null,
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });
      await Project.bulkCreate(projects, { transaction });
      console.log("✅ Projects mockup data inserted for deployment.");
    }

    // 최소 하나의 플래그가 제공되었는지 확인
    if (!argv.users && !argv.recruitments && !argv.projects) {
      console.error("🚨 Please specify --users, --recruitments, or --projects to process data");
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