FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm install sequelize-cli
CMD ["npx", "sequelize-cli", "db:migrate", "--url", "mysql://iam_user:Strong_Password123%2D@35.223.147.232:3306/teamitaka_database"]