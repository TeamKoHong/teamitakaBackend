#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Ajv = require("ajv");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("base-url", {
    type: "string",
    default:
      process.env.API_BASE_URL ||
      process.env.TEAMITAKA_API_BASE_URL ||
      "https://teamitakabackend.onrender.com",
    describe: "Base URL for the deployed API.",
  })
  .option("email", {
    type: "string",
    default:
      process.env.E2E_EMAIL ||
      process.env.TEAMITAKA_E2E_EMAIL,
    describe: "Seeded E2E account email.",
  })
  .option("password", {
    type: "string",
    default: process.env.E2E_PASSWORD || process.env.TEAMITAKA_E2E_PASSWORD,
    describe: "Seeded E2E account password. Prefer env vars over CLI args.",
  })
  .option("recruitment-id", {
    type: "string",
    default:
      process.env.E2E_RECRUITMENT_ID ||
      "84f60804-6f26-4bc3-b05b-08d09ad97343",
    describe: "Known recruitment id used by detail contract checks.",
  })
  .option("project-id", {
    type: "string",
    default:
      process.env.E2E_PROJECT_ID ||
      process.env.TEAMITAKA_E2E_PROJECT_ID ||
      null,
    describe: "Known project id used by review contract checks. Defaults to the first project available to the authenticated user.",
  })
  .option("output", {
    type: "string",
    default: "reports/qa/deployed-schema-smoke/latest.json",
    describe: "Path to write the machine-readable JSON report.",
  })
  .option("timeout-ms", {
    type: "number",
    default: Number(process.env.QA_SMOKE_TIMEOUT_MS || 30000),
    describe: "Per-request timeout in milliseconds.",
  })
  .strict()
  .help()
  .parseSync();

const baseUrl = String(argv.baseUrl || argv["base-url"]).replace(/\/+$/, "");
const password = argv.password;
const email = argv.email;
const outputPath = path.resolve(process.cwd(), argv.output);
const startedAt = new Date();

const ajv = new Ajv({ allErrors: true, strict: false });
const client = axios.create({
  baseURL: baseUrl,
  timeout: argv.timeoutMs || argv["timeout-ms"],
  validateStatus: () => true,
});

const report = {
  metadata: {
    name: "deployed-schema-smoke",
    baseUrl,
    email,
    startedAt: startedAt.toISOString(),
    nodeVersion: process.version,
  },
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    bySeverity: {},
  },
  checks: [],
};

const schemas = {
  health: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string" },
      database: { type: "string" },
    },
    additionalProperties: true,
  },
  login: {
    type: "object",
    required: ["success", "token", "user"],
    properties: {
      success: { const: true },
      token: { type: "string", minLength: 10 },
      user: { type: "object" },
    },
    additionalProperties: true,
  },
  authMe: {
    type: "object",
    required: ["success", "user"],
    properties: {
      success: { const: true },
      user: { type: "object" },
    },
    additionalProperties: true,
  },
  profileDetail: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { const: true },
      data: { type: "object" },
    },
    additionalProperties: true,
  },
  recruitmentListEnvelope: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: { const: true },
      message: { type: "string" },
      data: {
        type: "object",
        required: ["items", "pagination", "filters"],
        properties: {
          items: { type: "array" },
          pagination: {
            type: "object",
            required: ["page", "pageSize", "total"],
            properties: {
              page: { type: "number" },
              pageSize: { type: "number" },
              total: { type: "number" },
            },
            additionalProperties: true,
          },
          filters: { type: "object" },
        },
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
  recruitmentDetailEnvelope: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: { const: true },
      message: { type: "string" },
      data: {
        type: "object",
        required: ["recruitment_id", "title", "is_scrapped"],
        properties: {
          recruitment_id: { type: "string" },
          title: { type: "string" },
          is_scrapped: { type: "boolean" },
        },
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
  projectsMine: {
    type: "object",
    required: ["success", "items"],
    properties: {
      success: { const: true },
      items: { type: "array" },
      page: { type: "object" },
    },
    additionalProperties: true,
  },
  notifications: {
    type: "object",
    required: ["success", "data", "unreadCount"],
    properties: {
      success: { const: true },
      data: { type: "array" },
      unreadCount: { type: "number" },
    },
    additionalProperties: true,
  },
  unreadCount: {
    type: "object",
    required: ["success", "unreadCount"],
    properties: {
      success: { const: true },
      unreadCount: { type: "number" },
    },
    additionalProperties: true,
  },
  applicationsMine: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { const: true },
      data: { type: "array" },
    },
    additionalProperties: true,
  },
  dashboardCollection: {
    type: "object",
    required: ["success", "data", "items", "total", "limit", "offset"],
    properties: {
      success: { const: true },
      data: { type: "array" },
      items: { type: "array" },
      total: { type: "number" },
      limit: { type: "number" },
      offset: { type: "number" },
    },
    additionalProperties: true,
  },
  reviewSummary: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { const: true },
      data: {
        type: "object",
        required: ["averageRating", "totalReviews", "categoryAverages", "summary"],
        properties: {
          averageRating: { type: "number" },
          totalReviews: { type: "number" },
          categoryAverages: {
            type: "object",
            required: ["ability", "effort", "commitment", "communication", "reflection"],
            properties: {
              ability: { type: "number" },
              effort: { type: "number" },
              commitment: { type: "number" },
              communication: { type: "number" },
              reflection: { type: "number" },
            },
            additionalProperties: true,
          },
          summary: {
            type: "object",
            required: ["strengths", "improvements"],
            properties: {
              strengths: { type: "array" },
              improvements: { type: "array" },
            },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
};

const compiledSchemas = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, ajv.compile(schema)])
);

function bodySummary(body) {
  if (Array.isArray(body)) {
    return {
      type: "array",
      length: body.length,
      firstKeys:
        body.length > 0 && body[0] && typeof body[0] === "object"
          ? Object.keys(body[0]).slice(0, 20)
          : [],
    };
  }

  if (body && typeof body === "object") {
    const summary = {
      type: "object",
      keys: Object.keys(body).slice(0, 20),
    };

    if (Array.isArray(body.data)) {
      summary.data = { type: "array", length: body.data.length };
    } else if (body.data && typeof body.data === "object") {
      summary.data = {
        type: "object",
        keys: Object.keys(body.data).slice(0, 20),
      };
      if (Array.isArray(body.data.items)) {
        summary.data.items = { length: body.data.items.length };
      }
    }

    if (Array.isArray(body.items)) {
      summary.items = { length: body.items.length };
    }

    return summary;
  }

  return { type: typeof body };
}

function validationErrors(validate) {
  return (validate.errors || []).map((error) => ({
    instancePath: error.instancePath,
    keyword: error.keyword,
    message: error.message,
    params: error.params,
  }));
}

function addCheck(check) {
  const result = {
    severity: "P0",
    passed: false,
    skipped: false,
    ...check,
  };

  report.checks.push(result);
  report.summary.total += 1;
  const statusKey = result.skipped ? "skipped" : result.passed ? "passed" : "failed";
  report.summary[statusKey] += 1;
  report.summary.bySeverity[result.severity] =
    report.summary.bySeverity[result.severity] || { total: 0, passed: 0, failed: 0, skipped: 0 };
  report.summary.bySeverity[result.severity].total += 1;
  report.summary.bySeverity[result.severity][statusKey] += 1;

  const marker = result.skipped ? "SKIP" : result.passed ? "PASS" : "FAIL";
  const status = result.httpStatus ? ` HTTP ${result.httpStatus}` : "";
  console.log(`[${marker}] ${result.severity} ${result.name}${status}`);
  if ((result.skipped || !result.passed) && result.reason) {
    console.log(`       ${result.reason}`);
  }
}

async function checkRequest({
  name,
  severity = "P0",
  method = "get",
  url,
  headers,
  data,
  expectedStatus = 200,
  schemaName,
}) {
  const started = Date.now();

  try {
    const response = await client.request({ method, url, headers, data });
    const elapsedMs = Date.now() - started;
    const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    const statusOk = statuses.includes(response.status);

    let schemaOk = true;
    let errors = [];

    if (schemaName) {
      const validate = compiledSchemas[schemaName];
      schemaOk = validate(response.data);
      errors = validationErrors(validate);
    }

    addCheck({
      name,
      severity,
      method: method.toUpperCase(),
      url,
      httpStatus: response.status,
      elapsedMs,
      passed: statusOk && schemaOk,
      reason: statusOk
        ? schemaOk
          ? undefined
          : `Schema mismatch: ${errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ")}`
        : `Expected HTTP ${statuses.join(" or ")}, received HTTP ${response.status}`,
      bodySummary: bodySummary(response.data),
      schemaName,
      errors,
    });

    return response;
  } catch (error) {
    addCheck({
      name,
      severity,
      method: method.toUpperCase(),
      url,
      elapsedMs: Date.now() - started,
      passed: false,
      reason: error.message,
      errorCode: error.code,
    });
    return null;
  }
}

function extractToken(body) {
  return (
    body?.token ||
    body?.accessToken ||
    body?.data?.token ||
    body?.data?.accessToken ||
    null
  );
}

function extractFirstProjectId(body) {
  const candidates = [
    body?.items,
    body?.data?.items,
    body?.data,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const match = candidate.find((item) => item?.project_id || item?.projectId || item?.id);
    if (match) {
      return match.project_id || match.projectId || match.id;
    }
  }

  return null;
}

function writeReport() {
  report.metadata.finishedAt = new Date().toISOString();
  report.metadata.durationMs = new Date(report.metadata.finishedAt).getTime() - startedAt.getTime();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nReport: ${outputPath}`);
}

async function main() {
  if (!email || !password) {
    addCheck({
      name: "E2E credentials are configured",
      severity: "P0",
      passed: false,
      reason: "Set TEAMITAKA_E2E_EMAIL/E2E_EMAIL and TEAMITAKA_E2E_PASSWORD/E2E_PASSWORD before running this smoke.",
    });
    writeReport();
    process.exitCode = 2;
    return;
  }

  await checkRequest({
    name: "health endpoint responds",
    url: "/api/health",
    severity: "P1",
    schemaName: "health",
  });

  const loginResponse = await checkRequest({
    name: "seed account can log in",
    method: "post",
    url: "/api/auth/login",
    data: { email, password },
    schemaName: "login",
  });

  const token = extractToken(loginResponse?.data);
  if (!token) {
    addCheck({
      name: "auth token extracted",
      severity: "P0",
      passed: false,
      reason: "Login response did not include token/accessToken.",
      bodySummary: bodySummary(loginResponse?.data),
    });
    writeReport();
    process.exitCode = 1;
    return;
  }

  addCheck({
    name: "auth token extracted",
    severity: "P0",
    passed: true,
    bodySummary: { tokenPresent: true },
  });

  const authHeaders = { Authorization: `Bearer ${token}` };

  await checkRequest({
    name: "current user contract",
    url: "/api/auth/me",
    headers: authHeaders,
    schemaName: "authMe",
  });

  await checkRequest({
    name: "profile detail contract",
    url: "/api/profile/detail",
    headers: authHeaders,
    severity: "P1",
    schemaName: "profileDetail",
  });

  await checkRequest({
    name: "recruitment list OpenAPI envelope",
    url: "/api/recruitments?page=1&pageSize=1",
    schemaName: "recruitmentListEnvelope",
  });

  await checkRequest({
    name: "public recruitment detail OpenAPI envelope",
    url: `/api/recruitments/${argv.recruitmentId || argv["recruitment-id"]}`,
    schemaName: "recruitmentDetailEnvelope",
  });

  const projectsMineResponse = await checkRequest({
    name: "project list for current user",
    url: "/api/projects/mine",
    headers: authHeaders,
    severity: "P1",
    schemaName: "projectsMine",
  });

  await checkRequest({
    name: "notifications list contract",
    url: "/api/notifications",
    headers: authHeaders,
    severity: "P1",
    schemaName: "notifications",
  });

  await checkRequest({
    name: "notifications unread count contract",
    url: "/api/notifications/unread-count",
    headers: authHeaders,
    severity: "P1",
    schemaName: "unreadCount",
  });

  await checkRequest({
    name: "my applications contract",
    url: "/api/applications/mine",
    headers: authHeaders,
    severity: "P1",
    schemaName: "applicationsMine",
  });

  await checkRequest({
    name: "dashboard todos contract",
    url: "/api/todos?limit=1&offset=0",
    headers: authHeaders,
    schemaName: "dashboardCollection",
  });

  await checkRequest({
    name: "upcoming schedules contract",
    url: "/api/schedules/upcoming?days=14&limit=1&offset=0",
    headers: authHeaders,
    schemaName: "dashboardCollection",
  });

  const projectIdForReviewSummary =
    argv.projectId ||
    argv["project-id"] ||
    extractFirstProjectId(projectsMineResponse?.data);

  if (projectIdForReviewSummary) {
    await checkRequest({
      name: "project review summary contract",
      url: `/api/reviews/project/${projectIdForReviewSummary}/summary`,
      headers: authHeaders,
      severity: "P2",
      schemaName: "reviewSummary",
    });
  } else {
    addCheck({
      name: "project review summary contract",
      severity: "P2",
      skipped: true,
      passed: false,
      reason: "Authenticated user has no accessible project; provide E2E_PROJECT_ID to force this optional contract.",
    });
  }

  writeReport();

  if (report.summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  addCheck({
    name: "unhandled smoke error",
    severity: "P0",
    passed: false,
    reason: error.stack || error.message,
  });
  writeReport();
  process.exitCode = 1;
});
