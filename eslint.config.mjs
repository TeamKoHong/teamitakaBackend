import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    files: ["**/*.js"], 
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser, // 기존 브라우저 환경 유지
        ...globals.node     // ✅ Node.js 환경 추가 (process 사용 가능)
      }
    }
  },
  pluginJs.configs.recommended,
];
