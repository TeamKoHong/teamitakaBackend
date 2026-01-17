require("dotenv").config();

module.exports = {
  // APNs .p8 key configuration
  keyId: process.env.APNS_KEY_ID,
  teamId: process.env.APNS_TEAM_ID || "NWS3TZY4B9",
  bundleId: process.env.APNS_BUNDLE_ID || "com.teamitaka.teamitaka",

  // .p8 key file path (stored in Render Secret Files)
  keyPath: process.env.APNS_KEY_PATH || "/etc/secrets/AuthKey.p8",

  // Environment: 'production' uses production APNs, otherwise sandbox
  isProduction: process.env.NODE_ENV === "production",

  // APNs host URLs
  host: {
    production: "api.push.apple.com",
    sandbox: "api.sandbox.push.apple.com",
  },
};
