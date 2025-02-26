require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Recruitment, Project, ProjectMember, Todo, Timeline, Notification, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const dataPath = process.env.DATA_PATH || "/app/data"; // 컨테이너 환경에 맞춰진 경로
console.log("Data path:", dataPath); // 경로 확인

const argv = yargs(process.argv.slice(2))
  .option("users", { type: "boolean", default: false, description: "Process users" })
  .option("recruitments", { type: "boolean", default: false, description: "Process recruitments" })
  .option("projects", { type: "boolean", default: false, description: "Process projects" })
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
  await Profile.create(
    {
      user_id: user.user_id,
      nickname: data.username,
      profileImageUrl: data.profileImageUrl || "",
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  if (argv.verbose) console.log("✅ User and Profile created:", user.user_id);
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
  
  // 필수 필드 검사
  if (!user) throw new Error(`No user found for user_id: ${data.user_id}`);
  if (!recruitment) throw new Error(`No recruitment found for recruitment_id: ${data.recruitment_id}`);
  if (!data.title || !data.description || !data.recruitment_id) {
    throw new Error(`Missing required fields in project data: ${JSON.stringify(data)}`);
  }

  const project = await Project.create(
    {
      project_id: data.project_id || uuidv4(),
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      recruitment_id: data.recruitment_id,
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
    },
    { transaction }
  );
  console.log("✅ Project created:", project.project_id);
  return project;
}

async function loadMockupData() {
  console.log("Script version: Latest #394");
  console.log("argv:", argv);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion...");

    const users = [];
    const recruitments = [];
    const projects = [];

    // Step 1: Process Users
    if (argv.users) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "users_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (argv.verbose) console.log("Parsed users CSV row:", row);
            users.push(row);
          })
          .on("end", resolve)
          .on("error", (err) => {
            console.error("Error reading users_mockup.csv:", err.message);
            reject(err);
          });
      });

      for (const userData of users) {
        await createUser(userData, transaction);
      }
      console.log("✅ All Users and Profiles inserted.");
    }

    // Step 2: Process Recruitments
    if (argv.recruitments) {
      if (!argv.users) throw new Error("🚨 Recruitments require users data.");
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "recruitment_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            if (argv.verbose) console.log("Parsed recruitments CSV row:", row);
            recruitments.push(row);
          })
          .on("end", resolve)
          .on("error", (err) => {
            console.error("Error reading recruitment_mockup.csv:", err.message);
            reject(err);
          });
      });

      for (const recruitmentData of recruitments) {
        await createRecruitment(recruitmentData, users, transaction);
      }
      console.log("✅ All Recruitments inserted.");
    }

    // Step 3: Process Projects
    if (argv.projects) {
      if (!argv.users || !argv.recruitments) throw new Error("🚨 Projects require users and recruitments.");
      await new Promise((resolve, reject) => {
        if (!fs.existsSync(path.join(dataPath, "projects_mockup.csv"))) {
          console.error("projects_mockup.csv not found at:", path.join(dataPath, "projects_mockup.csv"));
          reject(new Error("projects_mockup.csv file missing"));
          return;
        }
        fs.createReadStream(path.join(dataPath, "projects_mockup.csv"))
          .pipe(csv({ 
            headers: ["project_id", "title", "description", "user_id", "recruitment_id", "createdAt", "updatedAt"], 
            skipEmptyLines: true, 
            trim: true 
          }))
          .on("data", (row) => {
            if (argv.verbose) console.log("Parsed projects CSV row:", row);
            projects.push(row);
          })
          .on("end", resolve)
          .on("error", (err) => {
            console.error("Error reading projects_mockup.csv:", err.message);
            reject(err);
          });
      });

      if (projects.length === 0) {
        console.warn("No projects data found in projects_mockup.csv");
      } else {
        for (const projectData of projects) {
          await createProject(projectData, users, recruitments, transaction);
        }
      }
      console.log("✅ All Projects inserted.");
    }

    if (!argv.users && !argv.recruitments && !argv.projects) {
      throw new Error("🚨 Specify at least one flag: --users, --recruitments, --projects");
    }

    await transaction.commit();
    console.log("✅ Mockup data insertion completed!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error.message, error.stack);
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