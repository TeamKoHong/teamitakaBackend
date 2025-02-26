require("dotenv").config();
const fs = require("fs");
const path = require("path"); // path 모듈 추가
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const { University, College, Department, sequelize } = require("../models");

async function insertDataFromCSV() {
  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Starting production CSV data insertion for deployment...");

    // 기존 실제 데이터 삭제 (배포 환경에서도 초기화)
    await Department.destroy({ where: {}, transaction });
    await College.destroy({ where: {}, transaction });
    await University.destroy({ where: {}, transaction });
    console.log("✅ Cleared existing production data for deployment.");

    const universitySet = new Set();
    const collegeSet = new Set();
    const departmentList = [];

    // CSV 파일 경로 설정 (프로젝트 루트의 seeders 폴더 기준)
    const filePath = path.join(process.cwd(), "seeders", "universities_colleges_departments.csv");

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      console.error(`🚨 CSV file not found at: ${filePath}`);
      throw new Error("CSV file not found");
    }
    console.log(`✅ CSV file found at: ${filePath}`);

    // CSV 파일 읽기
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: "utf8" }) // 인코딩 추가
        .pipe(csv())
        .on("data", (row) => {
          const { University: uniName, College: collegeName, Department: deptName } = row;
          if (!uniName || !collegeName || !deptName) {
            console.warn(`🚨 Skipping row with missing data: ${JSON.stringify(row)}`);
            return;
          }
          universitySet.add(uniName);
          collegeSet.add(`${uniName}-${collegeName}`);
          departmentList.push({ uniName, collegeName, deptName });
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("🚨 Error reading universities_colleges_departments.csv:", error);
          reject(error);
        });
    });
    console.log("✅ CSV data loaded into memory.");

    // Universities 삽입
    const universityMap = new Map();
    for (const uniName of universitySet) {
      const [university, created] = await University.findOrCreate({
        where: { Name: uniName },
        defaults: {
          Country: "대한민국",
        },
        transaction,
      });
      universityMap.set(uniName, university.ID);
      if (created) console.log(`✅ Created new University: ${uniName} with ID ${university.ID}`);
    }
    console.log("✅ Inserted Universities for deployment.");

    // Colleges 삽입
    const collegeMap = new Map();
    for (const collegeKey of collegeSet) {
      const [uniName, collegeName] = collegeKey.split("-");
      const universityID = universityMap.get(uniName);

      if (!universityID) {
        throw new Error(`🚨 UniversityID not found for ${uniName}`);
      }

      const [college, created] = await College.findOrCreate({
        where: { Name: collegeName, UniversityID: universityID },
        defaults: { Name: collegeName }, // UUID로 기본 키 생성
        transaction,
      });
      collegeMap.set(collegeKey, college.ID);
      if (created) console.log(`✅ Created new College: ${collegeName} under ${uniName} with ID ${college.ID}`);
    }
    console.log("✅ Inserted Colleges for deployment.");

    // Departments 삽입
    for (const { uniName, collegeName, deptName } of departmentList) {
      const collegeID = collegeMap.get(`${uniName}-${collegeName}`);

      if (!collegeID) {
        throw new Error(`🚨 CollegeID not found for ${collegeName} under ${uniName}`);
      }

      const [department, created] = await Department.findOrCreate({
        where: { Name: deptName, CollegeID: collegeID },
        defaults: { CollegeID: collegeID, Name: deptName },
        transaction,
      });
      if (created) console.log(`✅ Created new Department: ${deptName} under ${collegeName} with ID ${department.ID}`);
    }
    console.log("✅ Inserted Departments for deployment.");

    await transaction.commit();
    console.log("✅ Data insertion completed successfully for deployment!");
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error in production data insertion:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("✅ Database connection closed.");
  }
}

// 실행
if (require.main === module) {
  insertDataFromCSV().catch((err) => {
    console.error("🚨 Final error in insertDataFromCSV:", err);
    process.exit(1);
  });
}

module.exports = insertDataFromCSV;