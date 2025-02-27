require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
};