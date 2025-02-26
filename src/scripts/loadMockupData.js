require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Profile, Recruitment, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const dataPath = process.env.DATA_PATH || "/app/data";

const argv = yargs(process.argv.slice(2))
  .option("users", { type: "boolean", default: false, description: "Process users" })
  .option("recruitments", { type: "boolean", default: false, description: "Process recruitments" })
  .option("projects", { type: "boolean", default: false, description: "Process projects" })
  .help()
  .argv;

async function loadMockupData() {
  console.log("Script version: Latest #394");
  console.log("argv:", argv);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion...");

    const users = [];
    const profiles = [];
    const recruitments = [];
    const projects = [];

    if (argv.users) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "users_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed users CSV row:", row);
            users.push({
              user_id: row.user_id || uuidv4(),
              username: row.username,
              email: row.email,
              password: row.password,
              userType: row.userType || "MEMBER",
              role: row.role || "MEMBER",
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });

      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "users_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed profiles CSV row:", row);
            const user = users.find((u) => u.username === row.username);
            if (user) {
              profiles.push({
                user_id: user.user_id,
                nickname: row.username,
                profileImageUrl: row.profileImageUrl || "",
                createdAt: new Date(row.createdAt || Date.now()),
                updatedAt: new Date(row.updatedAt || Date.now()),
              });
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (users.length > 0) await User.bulkCreate(users, { transaction });
      if (profiles.length > 0) await Profile.bulkCreate(profiles, { transaction });
      console.log("✅ Users and Profiles inserted.");
    }

    if (argv.recruitments) {
      if (!argv.users) throw new Error("🚨 Recruitments require users data.");
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "recruitment_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed recruitments CSV row:", row);
            const user = users.find((u) => u.user_id === row.user_id);
            if (!user) throw new Error(`No user found for user_id '${row.user_id}'`);
            recruitments.push({
              recruitment_id: row.recruitment_id || uuidv4(),
              title: row.title,
              description: row.description,
              status: row.status || "OPEN",
              user_id: row.user_id,
              photo: row.photo || null,
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (recruitments.length > 0) await Recruitment.bulkCreate(recruitments, { transaction });
      console.log("✅ Recruitments inserted.");
    }

    if (argv.projects) {
      if (!argv.users || !argv.recruitments) throw new Error("🚨 Projects require users and recruitments.");
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(dataPath, "projects_mockup.csv"))
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed projects CSV row:", row);
            if (!row.title || !row.description || !row.user_id || !row.recruitment_id) {
              reject(new Error(`Missing required fields in projects CSV: ${JSON.stringify(row)}`));
              return;
            }
            projects.push({
              project_id: row.project_id || uuidv4(),
              title: row.title,
              description: row.description,
              user_id: row.user_id,
              recruitment_id: row.recruitment_id,
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (projects.length > 0) await Project.bulkCreate(projects, { transaction });
      console.log("✅ Projects inserted.");
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