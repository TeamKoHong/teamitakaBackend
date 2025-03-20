require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { University, College, Department, sequelize } = require("../models");

async function loadCSV(filePath) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { encoding: "utf8" })
      .pipe(csv({ skipEmptyLines: true, trim: true }))
      .on("data", (row) => {
        const { University: uniName, College: collegeName, Department: deptName } = row;
        if (!uniName || !collegeName || !deptName) {
          console.warn(`🚨 Skipping row with missing data: ${JSON.stringify(row)}`);
          return;
        }
        results.push({ uniName, collegeName, deptName });
      })
      .on("end", resolve)
      .on("error", (error) => {
        console.error(`🚨 Error reading CSV file at ${filePath}:`, error.message);
        reject(error);
      });
  });
}

async function insertDataFromCSV() {
  console.log("✅ Starting production CSV data insertion for deployment...");
  const transaction = await sequelize.transaction();
  try {
    // 기존 데이터 삭제
    await Department.destroy({ where: {}, transaction });
    await College.destroy({ where: {}, transaction });
    await University.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing production data for deployment.");

    // CSV 파일 로드
    const filePath = path.join(process.cwd(), "seeders", "universities_colleges_departments.csv");
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found at: ${filePath}`);
    }
    console.log(`✅ CSV file found at: ${filePath}`);

    const data = await loadCSV(filePath);
    console.log(`✅ Loaded ${data.length} rows from CSV.`);

    // Universities 삽입
    const universityMap = new Map();
    const uniqueUniversities = [...new Set(data.map(row => row.uniName))];
    for (const uniName of uniqueUniversities) {
      const [university, created] = await University.findOrCreate({
        where: { Name: uniName },
        defaults: { Country: "대한민국" },
        transaction,
      });
      universityMap.set(uniName, university.ID);
      if (created) console.log(`✅ Created University: ${uniName} (ID: ${university.ID})`);
    }
    console.log("✅ Inserted Universities for deployment.");

    // Colleges 삽입
    const collegeMap = new Map();
    const uniqueColleges = [...new Set(data.map(row => `${row.uniName}-${row.collegeName}`))];
    for (const collegeKey of uniqueColleges) {
      const [uniName, collegeName] = collegeKey.split("-");
      const universityID = universityMap.get(uniName);

      if (!universityID) {
        throw new Error(`🚨 UniversityID not found for ${uniName}`);
      }

      const [college, created] = await College.findOrCreate({
        where: { Name: collegeName, UniversityID: universityID },
        defaults: { UniversityID: universityID },
        transaction,
      });
      collegeMap.set(collegeKey, college.ID);
      if (created) console.log(`✅ Created College: ${collegeName} under ${uniName} (ID: ${college.ID})`);
    }
    console.log("✅ Inserted Colleges for deployment.");

    // Departments 삽입
    for (const { uniName, collegeName, deptName } of data) {
      const collegeID = collegeMap.get(`${uniName}-${collegeName}`);

      if (!collegeID) {
        throw new Error(`🚨 CollegeID not found for ${collegeName} under ${uniName}`);
      }

      const [department, created] = await Department.findOrCreate({
        where: { Name: deptName, CollegeID: collegeID },
        defaults: { CollegeID: collegeID },
        transaction,
      });
      if (created) console.log(`✅ Created Department: ${deptName} under ${collegeName} (ID: ${department.ID})`);
    }
    console.log("✅ Inserted Departments for deployment.");

    await transaction.commit();
    console.log("✅ Data insertion completed successfully for deployment!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error in production data insertion:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// 실행
if (require.main === module) {
  insertDataFromCSV().catch((err) => {
    console.error("🚨 Final error in insertDataFromCSV:", err.message);
    process.exit(1);
  });
}

module.exports = insertDataFromCSV;