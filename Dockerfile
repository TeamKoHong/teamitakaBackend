# 1️⃣ Node.js 공식 이미지 사용 (최신 LTS 버전 권장)
FROM node:18-alpine

# 2️⃣ 작업 디렉터리 설정
WORKDIR /app

# 3️⃣ package.json과 package-lock.json 복사 후 종속성 설치
COPY package*.json ./
RUN npm install --only=production

# 4️⃣ 애플리케이션 코드 복사
COPY . .

# 5️⃣ 실행 포트 설정
EXPOSE 8080

# 6️⃣ 컨테이너 시작 시 실행할 명령어
CMD ["npm", "start"]
