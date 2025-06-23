require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "teamitaka-default-jwt-secret-key-2024",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
};