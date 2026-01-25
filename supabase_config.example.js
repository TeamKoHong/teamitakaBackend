// Supabase 설정 파일 예시
// 실제 사용시에는 이 파일을 복사하여 supabase_config.js로 이름을 변경하고
// 실제 API 키로 업데이트하세요.

const { createClient } = require('@supabase/supabase-js');

// Supabase 프로젝트 정보
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
const supabaseServiceKey = 'your-service-key-here';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PostgreSQL 연결 설정 (Sequelize용)
const supabaseConfig = {
  development: {
    username: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'your-supabase-password',
    database: 'postgres',
    host: 'db.your-project-ref.supabase.co',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  },
  production: {
    username: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    host: 'db.your-project-ref.supabase.co',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};

module.exports = {
  supabase,
  supabaseConfig,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceKey
};
