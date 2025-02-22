require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { University, College, Department, sequelize } = require("../models");

async function insertDataFromCSV(filePath) {
  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting CSV data insertion...");

    // 기존 데이터 삭제
    await Department.destroy({ where: {}, transaction });
    await College.destroy({ where: {}, transaction });
    await University.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing data.");

    const universitySet = new Set();
    const collegeSet = new Set();
    const departmentList = [];

    // CSV 파일 읽기
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const { University: uniName, College: collegeName, Department: deptName } = row;
          universitySet.add(uniName);
          collegeSet.add(`${uniName}-${collegeName}`);
          departmentList.push({ uniName, collegeName, deptName });
        })
        .on("end", resolve)
        .on("error", reject);
    });
    console.log("✅ CSV data loaded into memory.");

    // Universities 삽입
    const universityMap = new Map();
    for (const uniName of universitySet) {
      const [university] = await University.findOrCreate({
        where: { Name: uniName },
        defaults: { Country: "대한민국" },
        transaction,
      });
      universityMap.set(uniName, university.ID);
    }
    console.log("✅ Inserted Universities.");

    // Colleges 삽입
    const collegeMap = new Map();
    for (const collegeKey of collegeSet) {
      const [uniName, collegeName] = collegeKey.split("-");
      const universityID = universityMap.get(uniName);

      if (!universityID) {
        throw new Error(`🚨 UniversityID not found for ${uniName}`);
      }

      const [college] = await College.findOrCreate({
        where: { Name: collegeName, UniversityID: universityID },
        transaction,
      });
      collegeMap.set(collegeKey, college.ID);
    }
    console.log("✅ Inserted Colleges.");

    // Departments 삽입
    for (const { uniName, collegeName, deptName } of departmentList) {
      const collegeID = collegeMap.get(`${uniName}-${collegeName}`);

      if (!collegeID) {
        throw new Error(`🚨 CollegeID not found for ${collegeName}`);
      }

      await Department.findOrCreate({
        where: { Name: deptName, CollegeID: collegeID },
        transaction,
      });
    }
    console.log("✅ Inserted Departments.");

    await transaction.commit();
    console.log("✅ Data insertion completed successfully!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error inserting data:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// 실행
if (require.main === module) {
  insertDataFromCSV("/app/seeders/universities_colleges_departments.csv").catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = insertDataFromCSV;