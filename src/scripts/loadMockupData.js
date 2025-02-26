require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Recruitment, Project, ProjectMember, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const dataPath = process.env.DATA_PATH || "/app/data"; // 환경 변수로 경로 설정
console.log("Data path:", dataPath);

// 명령줄 인자 파싱
const argv = yargs(process.argv.slice(2))
  .option("users", { type: "boolean", default: false, description: "Process users" })
  .option("recruitments", { type: "boolean", default: false, description: "Process recruitments" })
  .option("projects", { type: "boolean", default: false, description: "Process projects" })
  .option("projectmembers", { type: "boolean", default: false, description: "Process project members" })
  .option("verbose", { type: "boolean", default: false, description: "Enable verbose logging" })
  .help()
  .argv;

// 사용자 생성 함수
async function createUser(data, transaction) {
  if (argv.verbose) console.log("Creating user:", data);
  const user = await User.create(
    {
      user_id: data.user_id || uuidv4(),
      username: data.username,
      email: data.email,
      password: data.password,
      userType: data.userType || "MEMBER",
      role: data.role || "MEMBER",
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  if (argv.verbose) console.log("✅ User created:", user.user_id);
  return user;
}

// 모집 공고 생성 함수
async function createRecruitment(data, users, transaction) {
  if (argv.verbose) console.log("Creating recruitment:", data);
  const user = users.find((u) => u.user_id === data.user_id);
  if (!user) throw new Error(`No user found for user_id: ${data.user_id}`);
  const recruitment = await Recruitment.create(
    {
      recruitment_id: data.recruitment_id || uuidv4(),
      title: data.title || "Untitled Recruitment",
      description: data.description || "No description provided",
      status: data.status || "OPEN",
      user_id: data.user_id,
      photo: data.photo || null,
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  if (argv.verbose) console.log("✅ Recruitment created:", recruitment.recruitment_id);
  return recruitment;
}

// 프로젝트 생성 함수
async function createProject(data, users, recruitments, transaction) {
  if (argv.verbose) console.log("Creating project:", data);
  const user = users.find((u) => u.user_id === data.user_id);
  const recruitment = recruitments.find((r) => r.recruitment_id === data.recruitment_id);
  if (!user) throw new Error(`No user found for user_id: ${data.user_id}`);
  if (!recruitment) throw new Error(`No recruitment found for recruitment_id: ${data.recruitment_id}`);
  if (!data.title || !data.description) {
    throw new Error(`Missing required fields in project data: ${JSON.stringify(data)}`);
  }

  const project = await Project.create(
    {
      project_id: data.project_id || uuidv4(),
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      recruitment_id: data.recruitment_id,
      status: data.status || "예정",
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  console.log("✅ Project created:", project.project_id);
  return project;
}

// 프로젝트 멤버 생성 함수
async function createProjectMember(data, projects, users, transaction) {
  if (argv.verbose) console.log("Creating project member:", data);
  const project = projects.find((p) => p.project_id === data.project_id);
  const user = users.find((u) => u.user_id === data.user_id);
  if (!project) throw new Error(`No project found for project_id: ${data.project_id}`);
  if (!user) throw new Error(`No user found for user_id: ${data.user_id}`);
  if (!data.role) throw new Error(`Missing role for project member: ${JSON.stringify(data)}`);

  const projectMember = await ProjectMember.create(
    {
      id: data.id || uuidv4(),
      project_id: data.project_id,
      user_id: data.user_id,
      role: data.role,
      joined_at: new Date(data.joined_at || Date.now()),
      status: data.status || "활성",
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  console.log("✅ ProjectMember created:", projectMember.id);
  return projectMember;
}

async function loadMockupData() {
  console.log("Starting mockup data insertion...");
  const transaction = await sequelize.transaction();
  try {
    const users = [];
    const recruitments = [];
    const projects = [];
    const projectMembers = [];

    // Step 1: 사용자 데이터 처리
    if (argv.users) {
      const userFilePath = path.join(dataPath, "users_mockup.csv");
      if (!fs.existsSync(userFilePath)) throw new Error(`users_mockup.csv not found at: ${userFilePath}`);
      await new Promise((resolve, reject) => {
        fs.createReadStream(userFilePath)
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (!row.username || !row.email || !row.password) {
              console.error("Missing required fields in user row:", row);
              reject(new Error("Missing required fields in user data"));
              return;
            }
            users.push(row);
          })
          .on("end", resolve)
          .on("error", reject);
      });
      for (const userData of users) {
        await createUser(userData, transaction);
      }
      console.log("✅ All Users inserted.");
    }

    // Step 2: 모집 공고 데이터 처리
    if (argv.recruitments) {
      if (!argv.users) throw new Error("🚨 Recruitments require users data.");
      const recruitmentFilePath = path.join(dataPath, "recruitment_mockup.csv");
      if (!fs.existsSync(recruitmentFilePath)) throw new Error(`recruitment_mockup.csv not found at: ${recruitmentFilePath}`);
      await new Promise((resolve, reject) => {
        fs.createReadStream(recruitmentFilePath)
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (!row.user_id) {
              console.error("Missing user_id in recruitment row:", row);
              reject(new Error("Missing user_id in recruitment data"));
              return;
            }
            recruitments.push(row);
          })
          .on("end", resolve)
          .on("error", reject);
      });
      for (const recruitmentData of recruitments) {
        await createRecruitment(recruitmentData, users, transaction);
      }
      console.log("✅ All Recruitments inserted.");
    }

    // Step 3: 프로젝트 데이터 처리
    if (argv.projects) {
      if (!argv.users || !argv.recruitments) throw new Error("🚨 Projects require users and recruitments.");
      const projectFilePath = path.join(dataPath, "projects_mockup.csv");
      if (!fs.existsSync(projectFilePath)) throw new Error(`projects_mockup.csv not found at: ${projectFilePath}`);
      await new Promise((resolve, reject) => {
        fs.createReadStream(projectFilePath)
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (!row.title || !row.description || !row.user_id || !row.recruitment_id) {
              console.error("Missing required fields in project row:", row);
              reject(new Error("Missing required fields in project data"));
              return;
            }
            projects.push(row);
          })
          .on("end", resolve)
          .on("error", reject);
      });
      for (const projectData of projects) {
        await createProject(projectData, users, recruitments, transaction);
      }
      console.log("✅ All Projects inserted.");
    }

    // Step 4: 프로젝트 멤버 데이터 처리
    if (argv.projectmembers) {
      if (!argv.users || !argv.projects) throw new Error("🚨 ProjectMembers require users and projects.");
      const projectMemberFilePath = path.join(dataPath, "projectmembers_mockup.csv");
      if (!fs.existsSync(projectMemberFilePath)) throw new Error(`projectmembers_mockup.csv not found at: ${projectMemberFilePath}`);
      await new Promise((resolve, reject) => {
        fs.createReadStream(projectMemberFilePath)
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (!row.project_id || !row.user_id || !row.role) {
              console.error("Missing required fields in project member row:", row);
              reject(new Error("Missing required fields in project member data"));
              return;
            }
            projectMembers.push(row);
          })
          .on("end", resolve)
          .on("error", reject);
      });
      for (const projectMemberData of projectMembers) {
        await createProjectMember(projectMemberData, projects, users, transaction);
      }
      console.log("✅ All ProjectMembers inserted.");
    }

    await transaction.commit();
    console.log("✅ Mockup data insertion completed!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

if (require.main === module) {
  loadMockupData().catch((err) => console.error("🚨 Final error:", err.stack));
}

module.exports = { loadMockupData };