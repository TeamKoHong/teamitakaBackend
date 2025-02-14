module.exports = {
    roots: ["<rootDir>/src"], // ✅ Jest가 테스트 파일을 찾을 기본 경로 지정
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "src"], // ✅ 모듈 탐색 경로 추가
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1", // ✅ alias 설정 (있다면)
    },
  };
  