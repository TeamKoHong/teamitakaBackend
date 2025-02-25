require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Recruitment, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const argv = yargs(process.argv.slice(2))
  .option("users", { type: "boolean", default: false, description: "사용자 데이터 삽입" })
  .option("recruitments", { type: "boolean", default: false, description: "모집 데이터 삽입" })
  .option("projects", { type: "boolean", default: false, description: "프로젝트 데이터 삽입" })
  .help()
  .argv;

async function loadMockupData() {
  console.log("스크립트 버전: 최신");
  console.log("argv.users:", argv.users);
  console.log("argv.recruitments:", argv.recruitments);
  console.log("argv.projects:", argv.projects);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ 배포용 목업 데이터 삽입 시작...");

    // 기존 데이터 삭제
    await User.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });
    await Recruitment.destroy({ where: {}, transaction });
    await Project.destroy({ where: {}, transaction });
    console.log("✅ 기존 목업 데이터 삭제 완료.");

    const users = [];
    const recruitments = [];
    const projects = [];

    // Users 및 Profiles 삽입
    if (argv.users) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
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
          .on("error", reject);
      });
      await User.bulkCreate(users, { transaction });
      console.log("✅ Users 데이터 삽입 완료.");
    }

    // Recruitments 삽입
    if (argv.recruitments) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/recruitment_mockup.csv")
          .pipe(csv())
          .on("data", (row) => {
            const user = users.find((u) => u.username === row.username);
            if (!user) throw new Error(`사용자 ${row.username} 없음`);
            recruitments.push({
              recruitment_id: uuidv4(),
              title: row.title,
              description: row.description,
              status: row.status || "OPEN",
              user_id: user.user_id,
              photo: row.photo || null,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });
      await Recruitment.bulkCreate(recruitments, { transaction });
      console.log("✅ Recruitments 데이터 삽입 완료.");
    }

    // Projects 삽입
    if (argv.projects) {
      if (!argv.recruitments) {
        throw new Error("Projects 삽입은 Recruitments 삽입을 요구합니다. --recruitments를 지정하세요.");
      }
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv())
          .on("data", (row) => {
            const user = users.find((u) => u.username === row.username);
            if (!user) throw new Error(`사용자 ${row.username} 없음`);
            projects.push({
              project_id: uuidv4(),
              title: row.title,
              description: row.description,
              user_id: user.user_id,
              recruitment_id: null, // 필요 시 recruitments에서 매핑 가능
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });
      await Project.bulkCreate(projects, { transaction });
      console.log("✅ Projects 데이터 삽입 완료.");
    }

    await transaction.commit();
    console.log("✅ 목업 데이터 삽입 성공적으로 완료!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 목업 데이터 삽입 오류:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

loadMockupData();