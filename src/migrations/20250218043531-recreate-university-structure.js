"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * 1) 기존 테이블 제거
     *    - Foreign Key 제약으로 인해 Departments → Colleges → Campuses → Universities 순서로 드롭
     *    - Campus 테이블은 더 이상 사용하지 않으므로, 재생성하지 않는다.
     */
    await queryInterface.dropTable("Departments");
    await queryInterface.dropTable("Colleges");
    await queryInterface.dropTable("Campuses"); // 완전히 제거
    await queryInterface.dropTable("Universities");

    /**
     * 2) 새 Universities 테이블 생성
     *    - 기존 스키마와 동일하게 작성하며,
     *      createdAt, updatedAt 등을 포함하여 Sequelize 표준 양식을 맞춘다.
     */
    await queryInterface.createTable("Universities", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      Country: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    /**
     * 3) 새 Colleges 테이블 생성
     *    - 더 이상 CampusID를 사용하지 않고, UniversityID를 직접 참조.
     */
    await queryInterface.createTable("Colleges", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UniversityID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Universities",
          key: "ID",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      Name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    /**
     * 4) 새 Departments 테이블 생성
     *    - CollegeID만 참조하므로, 기존 스키마 그대로 사용.
     */
    await queryInterface.createTable("Departments", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CollegeID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Colleges",
          key: "ID",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      Name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    /**
     * down 시에는 up 과정에서 만든 새 테이블을 모두 삭제한 뒤,
     * 원래 구조(또는 필요하다면 Campus 테이블까지) 복원할 수 있도록 작성한다.
     * Campus 테이블을 완전히 복원해야 하는 경우에는 아래 주석을 참고.
     */

    // 새로 만든 순서의 역순으로 삭제
    await queryInterface.dropTable("Departments");
    await queryInterface.dropTable("Colleges");
    await queryInterface.dropTable("Universities");

    /**
     * 만약 Campus 테이블까지 원상 복구하려면 (필요 시):
     *
     * await queryInterface.createTable("Universities", { ...이전 스키마... });
     * await queryInterface.createTable("Campuses", { ... });
     * await queryInterface.createTable("Colleges", { ...원래대로 CampusID 사용... });
     * await queryInterface.createTable("Departments", { ... });
     *
     * 이런 식으로 작성하면 된다.
     */
  },
};
