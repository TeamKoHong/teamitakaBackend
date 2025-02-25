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
  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting mockup data insertion for deployment...");

    // Clear existing data
    await User.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });
    await Project.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing mockup data for deployment.");

    const users = [];
    const profiles = [];
    const projects = [];

    // Process Users and Profiles if --users flag is provided
    if (argv.users) {
      // Prepare Users data from CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed users CSV row:", row);
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

      // Prepare Profiles data from CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/users_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row) => {
            console.log("Parsed profiles CSV row:", row);
            const user = users.find((u) => u.username === row.username);
            if (user) {
              profiles.push({
                user_id: user.user_id,
                nickname: row.username,
                profileImageUrl: row.profileImageUrl || "",
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
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

      // Insert Users and Profiles into the database
      if (users.length > 0) {
        await User.bulkCreate(users, { transaction });
        console.log("✅ Users mockup data inserted for deployment.");
      }
      if (profiles.length > 0) {
        await Profile.bulkCreate(profiles, { transaction });
        console.log("✅ Profiles mockup data inserted for deployment.");
      }
    }

    // Process Projects if --projects flag is provided
    if (argv.projects) {
      await new Promise((resolve, reject) => {
        fs.createReadStream("/app/data/projects_mockup.csv")
          .pipe(csv({ skipEmptyLines: true, trim: true }))
          .on("data", (row, index) => {
            console.log(`Parsed projects CSV row (line ${index + 2}):`, row); // +2 accounts for header and 1-based line numbering
            // Validate required fields
            if (!row.title) {
              throw new Error(
                `Missing 'title' in CSV row (line ${index + 2}): ${JSON.stringify(row)}`
              );
            }
            const project = {
              project_id: row.project_id || uuidv4(),
              title: row.title.trim(), // Required field, sourced from CSV
              user_id: row.user_id || (users[0]?.user_id) || uuidv4(), // Fallback to first user or new UUID
              createdAt: new Date(row.createdAt || Date.now()),
              updatedAt: new Date(row.updatedAt || Date.now()),
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

      // Insert Projects into the database
      if (projects.length > 0) {
        await Project.bulkCreate(projects, { transaction });
        console.log("✅ Projects inserted successfully.");
      }
    }

    // Check if at least one flag is provided
    if (!argv.users && !argv.projects) {
      console.error("🚨 Please specify --users or --projects to process data");
      process.exit(1);
    }

    // Commit the transaction if all operations succeed
    await transaction.commit();
    console.log("✅ Mockup data insertion completed successfully for deployment!");
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.error("🚨 Error in mockup data insertion:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// Execute the function if run directly
if (require.main === module) {
  loadMockupData().catch((err) => {
    console.error("🚨 Final error in loadMockupData:", err);
    process.exit(1);
  });
}

module.exports = { loadMockupData };