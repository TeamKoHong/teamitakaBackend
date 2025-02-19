// migrations/xxxxxx-create-application-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Applications', {
      application_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 외래 키 제약 조건 추가
    await queryInterface.addConstraint('Applications', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_id',
      references: {
        table: 'Users', // 'Users' 테이블과 연결
        field: 'id', // 'id' 컬럼과 연결
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('Applications', {
      fields: ['recruitment_id'],
      type: 'foreign key',
      name: 'fk_recruitment_id',
      references: {
        table: 'Recruitments', // 'Recruitments' 테이블과 연결
        field: 'id', // 'id' 컬럼과 연결
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 외래 키 제약 조건 제거
    await queryInterface.removeConstraint('Applications', 'fk_user_id');
    await queryInterface.removeConstraint('Applications', 'fk_recruitment_id');

    // 테이블 삭제
    await queryInterface.dropTable('Applications');
  }
};
