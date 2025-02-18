require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { University, College, Department, sequelize } = require("../models");

async function insertDataFromCSV(filePath) {
  const transaction = await sequelize.transaction();
  try {
    console.log("✅ Database sync complete.");

    // 🔥 Foreign Key Constraints 해제
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction });

    // 🔥 기존 데이터 삭제
    await Department.destroy({ where: {} }, { transaction });
    await College.destroy({ where: {} }, { transaction });
    await University.destroy({ where: {} }, { transaction });

    // 🔥 Foreign Key Constraints 다시 활성화
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction });

    console.log("✅ 기존 데이터 삭제 완료.");

    const universitySet = new Set();
    const collegeSet = new Set();
    const departmentList = [];

    // 1차 스캔: CSV 파일을 읽어서 University, College, Department 정보를 메모리에 저장
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const { University: uniName, College: collegeName, Department: deptName } = row;
        universitySet.add(uniName);
        collegeSet.add(`${uniName}-${collegeName}`);
        departmentList.push({ uniName, collegeName, deptName });
      })
      .on("end", async () => {
        console.log("✅ CSV 데이터 처리 완료. University & College 먼저 삽입 시작...");

        // 2차 실행: University 삽입
        const universityMap = new Map();
        for (const uniName of universitySet) {
          const [university] = await University.findOrCreate({
            where: { Name: uniName },
            defaults: { Country: "대한민국" },
            transaction,
          });
          universityMap.set(uniName, university.ID);
        }

        // 3차 실행: College 삽입
        const collegeMap = new Map();
        for (const collegeKey of collegeSet) {
          const [uniName, collegeName] = collegeKey.split("-");
          const universityID = universityMap.get(uniName);

          if (!universityID) {
            throw new Error(`🚨 오류 발생: UniversityID를 찾을 수 없습니다. (University: ${uniName})`);
          }

          const [college] = await College.findOrCreate({
            where: { Name: collegeName, UniversityID: universityID },
            transaction,
          });

          collegeMap.set(collegeKey, college.ID);
        }

        // 4차 실행: Department 삽입
        for (const { uniName, collegeName, deptName } of departmentList) {
          const collegeID = collegeMap.get(`${uniName}-${collegeName}`);

          if (!collegeID) {
            throw new Error(`🚨 오류 발생: CollegeID를 찾을 수 없습니다. (College: ${collegeName})`);
          }

          await Department.create({
            Name: deptName,
            CollegeID: collegeID,
          }, { transaction });
        }

        await transaction.commit();
        console.log("✅ 데이터 삽입 완료!");
        await sequelize.close();
        console.log("✅ Database connection closed.");
      });
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Error inserting data:", error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  insertDataFromCSV("seeders/universities_colleges_departments.csv").catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = insertDataFromCSV;
