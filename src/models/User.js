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
      team_experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '팀플 경험 횟수 (0-99)',
      },
      keywords: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: '관심 키워드 배열',
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '학과/학부명',
      },
      enrollment_status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '재학 중',
        comment: '재학 상태 (재학 중, 휴학 중, 졸업)',
      },
      mbti_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'MBTI 유형 결과 (예: LION, 활동티미)',
      },
    },
    {
      tableName: "users",
      timestamps: true,
      // 🔧 환경별 타임스탬프 컬럼명 설정
      // - Local (MySQL): createdAt, updatedAt (camelCase)
      // - Production (PostgreSQL): created_at, updated_at (snake_case)
      createdAt: process.env.NODE_ENV === 'production' ? 'created_at' : 'createdAt',
      updatedAt: process.env.NODE_ENV === 'production' ? 'updated_at' : 'updatedAt',
    }
  );

  return User;
};
