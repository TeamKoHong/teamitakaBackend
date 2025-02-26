require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { User, Recruitment, Project, sequelize } = require("../models");
const yargs = require("yargs/yargs");

const argv = yargs(process.argv.slice(2))
  .option("users", {
    type: "boolean",
    default: true,
    description: "Process users from users_mockup.csv",
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
  console.log("Script version: Latest #394");
  console.log("argv.users:", argv.users);
  console.log("argv.recruitments:", argv.recruitments);
  console.log("argv.projects:", argv.projects);

  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion for deployment...");

    const users = [];
    const recruitments = [];
    const projects = [];

    // Process Users (--users flag)
    if (argv.users) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
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
          .on("error", (error) => {
            console.error("🚨 Error reading users_mockup.csv:", error);
            reject(error);
          });
      });

      if (users.length > 0) {
        await User.bulkCreate(users, { transaction });
        console.log("✅ Users mockup data inserted for deployment.");
      }
    }

    // Process Recruitments (--recruitments flag)
    if (argv.recruitments) {
      if (!argv.users) {
        throw new Error("🚨 Recruitments require users data. Use --users flag first.");
      }
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/recruitment_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row, index) => {
            console.log(`Parsed recruitments CSV row (line ${index + 2}):`, row);
            if (!row.title || !row.description || !row.username) {
              throw new Error(`Missing required fields in recruitments CSV (line ${index + 2}): ${JSON.stringify(row)}`);
            }
            const user = users.find((u) => u.username === row.username);
            if (!user) throw new Error(`No user found for username '${row.username}'`);
            recruitments.push({
              recruitment_id: row.recruitment_id || uuidv4(),
              title: row.title.trim(),
              description: row.description.trim(),
              status: row.status || "OPEN",
              user_id: user.user_id,
              photo: row.photo || null,
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
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

    // Process Projects (--projects flag)
    if (argv.projects) {
      if (!argv.users || !argv.recruitments) {
        throw new Error("🚨 Projects require users and recruitments data. Use --users and --recruitments flags first.");
      }
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed projects CSV row:", row);
            // Validate all required fields
            if (!row.title || !row.description || !row.user_id || !row.recruitment_id) {
              throw new Error(`Missing required fields in projects CSV: ${JSON.stringify(row)}`);
            }
            const user = users.find((u) => u.user_id === row.user_id);
            const recruitment = recruitments.find((r) => r.recruitment_id === row.recruitment_id);
            if (!user) throw new Error(`No user found for user_id '${row.user_id}'`);
            if (!recruitment) throw new Error(`No recruitment found for recruitment_id '${row.recruitment_id}'`);
            projects.push({
              project_id: row.project_id || uuidv4(),
              title: row.title,
              description: row.description,
              user_id: row.user_id,
              recruitment_id: row.recruitment_id,
              role: row.role || null,
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
            });
          })
          .on("end", resolve)
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

    // Ensure at least one flag is provided
    if (!argv.users && !argv.recruitments && !argv.projects) {
      console.error("🚨 Please specify --users, --recruitments, or --projects to process data");
      process.exit(1);
    }

    // Commit transaction
    await transaction.commit();
    console.log("✅ Mockup data insertion completed successfully for deployment!");
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

if (require.main === module) {
  loadMockupData().catch((err) => {
    console.error("🚨 Final error in loadMockupData:", err.stack);
    process.exit(1);
  });
}

module.exports = { loadMockupData };
