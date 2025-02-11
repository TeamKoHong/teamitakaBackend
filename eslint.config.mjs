import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.node } }, // ✅ Node.js 환경 추가
  pluginJs.configs.recommended,
  { files: ["tests/**/*.js"], languageOptions: { globals: globals.jest } } // ✅ Jest 전역 함수 허용
];
