require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
const jwtIssuer = process.env.JWT_ISSUER || "teamitaka-api";

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required.");
}

module.exports = {
  jwtSecret,
  jwtIssuer,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
