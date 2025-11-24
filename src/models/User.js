const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: { 
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_type: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
        field: 'userType', // 데이터베이스 컬럼명 매핑
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
      },
      university: { // 대학 정보 추가
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      major: { // 전공 정보 추가
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      avatar: { // 프로필 사진 (URL)
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bio: { // 자기소개
        type: DataTypes.TEXT,
        allowNull: true,
      },
      awards: { // 수상이력
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skills: { // 보유 스킬 (예: "JavaScript, Python, React")
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // experience_years: { // 경력 (년) - 데이터베이스에 컬럼 없음
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   comment: "경력 (년 단위)",
      // },
      portfolio_url: { // 포트폴리오 링크
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      firebase_phone_uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Firebase Phone Auth UID',
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'E.164 형식 전화번호 (예: +821012345678)',
      },
      phone_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '전화번호 인증 완료 여부',
      },
      phone_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '전화번호 인증 완료 시각',
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return User;
};
