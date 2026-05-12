#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const axios = require("axios");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const repoRoot = path.resolve(__dirname, "../..");

const argv = yargs(hideBin(process.argv))
  .option("base-url", {
    type: "string",
    default:
      process.env.API_BASE_URL ||
      process.env.TEAMITAKA_API_BASE_URL ||
      "https://teamitakabackend.onrender.com",
    describe: "Base URL for the deployed API.",
  })
  .option("namespace", {
    type: "string",
    default: process.env.TEAMITAKA_E2E_NAMESPACE || "e2e_20260510",
    describe: "E2E persona namespace seeded in Supabase.",
  })
  .option("reset-before", {
    type: "boolean",
    default: false,
    describe: "Reset Supabase E2E personas before running the mutation smoke.",
  })
  .option("reset-after", {
    type: "boolean",
    default: false,
    describe: "Reset Supabase E2E personas after running the mutation smoke.",
  })
  .option("confirm-production", {
    type: "boolean",
    default: false,
    describe: "Forward --confirm-production to the Supabase persona seeder.",
  })
  .option("manifest", {
    type: "string",
    default: null,
    describe: "Path to an existing Supabase persona manifest JSON.",
  })
  .option("output", {
    type: "string",
    default: "reports/qa/deployed-mutation-smoke/latest.json",
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
const namespace = argv.namespace;
const outputPath = path.resolve(repoRoot, argv.output);
const manifestPath = path.resolve(
  repoRoot,
  argv.manifest || `reports/e2e-personas/${namespace}.supabase.json`,
);
const seedScriptPath = path.resolve(repoRoot, "scripts/e2e/seed-test-personas-supabase.js");

const report = {
  metadata: {
    name: "deployed-mutation-smoke",
    baseUrl,
    namespace,
    startedAt: new Date().toISOString(),
    nodeVersion: process.version,
    resetBefore: argv.resetBefore || argv["reset-before"],
    resetAfter: argv.resetAfter || argv["reset-after"],
  },
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
  checks: [],
};

const client = axios.create({
  baseURL: baseUrl,
  timeout: argv.timeoutMs || argv["timeout-ms"],
  validateStatus: () => true,
});

const tokenByPersona = {};
const userByPersona = {};

const summarizeBody = (body) => {
  if (!body || typeof body !== "object") return body;
  const copy = JSON.parse(JSON.stringify(body));
  delete copy.token;
  delete copy.accessToken;
  delete copy.password;
  return copy;
};

const userIdOf = (user) => user?.user_id || user?.userId;
const personaByKey = (seed, personaKey) => seed.personas.find((candidate) => candidate.key === personaKey);

const record = (name, passed, details = {}) => {
  report.checks.push({ name, passed, details });
  report.summary.total += 1;
  if (passed) {
    report.summary.passed += 1;
  } else {
    report.summary.failed += 1;
  }
  process.stdout.write(`[${passed ? "PASS" : "FAIL"}] ${name}\n`);
};

const writeReport = () => {
  report.metadata.finishedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
};

const seedPersonas = () => {
  const args = ["up", `--namespace=${namespace}`, "--json"];
  if (argv.confirmProduction || argv["confirm-production"]) {
    args.push("--confirm-production");
  }

  const stdout = execFileSync(process.execPath, [seedScriptPath, ...args], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return JSON.parse(stdout);
};

const loadSeedManifest = () => {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Missing E2E persona manifest: ${manifestPath}. Run with --reset-before or seed personas first.`,
    );
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
};

const expectStatus = async (name, request, expectedStatuses) => {
  const expected = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
  let response;

  try {
    response = await client.request(request);
  } catch (error) {
    record(name, false, {
      expected,
      error: error.message,
      code: error.code,
    });
    throw error;
  }

  const passed = expected.includes(response.status);
  record(name, passed, {
    status: response.status,
    expected,
    body: passed ? undefined : summarizeBody(response.data),
  });

  if (!passed) {
    throw new Error(`${name} expected ${expected.join("/")} got ${response.status}`);
  }

  return response.data;
};

const authHeaders = (personaKey) => ({
  Authorization: `Bearer ${tokenByPersona[personaKey]}`,
});

const login = async (personaKey, seed) => {
  const persona = seed.personas.find((candidate) => candidate.key === personaKey);
  if (!persona) {
    throw new Error(`Missing persona in manifest: ${personaKey}`);
  }

  const data = await expectStatus(`login ${personaKey}`, {
    method: "post",
    url: "/api/auth/login",
    data: {
      email: persona.email,
      password: seed.password,
    },
  }, 200);

  tokenByPersona[personaKey] = data.token || data.accessToken;
  userByPersona[personaKey] = data.user;

  const id = userIdOf(data.user);
  const hasContract = Boolean(tokenByPersona[personaKey] && id);
  record(`login ${personaKey} token contract`, hasContract, {
    userId: id,
    body: hasContract ? undefined : summarizeBody(data),
  });

  if (!hasContract) {
    throw new Error(`login ${personaKey} did not return token/user id`);
  }
};

const runSmoke = async (seed) => {
  await login("owner", seed);
  await login("applicant_a", seed);
  await login("applicant_b", seed);

  const { openRecruitmentId, reviewRecruitmentId } = seed.recruitments;

  const applyData = await expectStatus("applicant_a applies to open recruitment", {
    method: "post",
    url: `/api/applications/${openRecruitmentId}`,
    headers: authHeaders("applicant_a"),
    data: {
      introduction: "QA mutation smoke application. This row should be removed by cancel.",
      portfolio_project_ids: [],
    },
  }, 201);
  const appliedApplicationId = applyData.data?.application_id || applyData.application_id;
  if (!appliedApplicationId) {
    throw new Error("apply response did not include application_id");
  }

  await expectStatus("applicant_a cancels application", {
    method: "post",
    url: `/api/applications/${appliedApplicationId}/cancel`,
    headers: authHeaders("applicant_a"),
  }, 200);

  const applicants = await expectStatus("owner lists review recruitment applicants", {
    method: "get",
    url: `/api/applications/${reviewRecruitmentId}`,
    headers: authHeaders("owner"),
  }, 200);
  const pending = (Array.isArray(applicants) ? applicants : applicants.data || [])
    .filter((application) => application.status === "PENDING");

  record("review recruitment has two pending applicants", pending.length >= 2, {
    pendingCount: pending.length,
  });
  if (pending.length < 2) {
    throw new Error("not enough pending applicants to approve/reject");
  }

  const approveTarget = pending[0];
  const rejectTarget = pending[1];

  const approveData = await expectStatus("owner approves applicant before kickoff", {
    method: "post",
    url: `/api/applications/${approveTarget.application_id}/approve`,
    headers: authHeaders("owner"),
  }, 200);
  const approvedStatus = approveData.application?.status || approveData.updatedApplication?.status;
  record("approve response status is APPROVED", approvedStatus === "APPROVED", {
    approvedStatus,
  });
  if (approvedStatus !== "APPROVED") {
    throw new Error(`approve response status mismatch: ${approvedStatus}`);
  }

  await expectStatus("owner rejects second applicant", {
    method: "post",
    url: `/api/applications/${rejectTarget.application_id}/reject`,
    headers: authHeaders("owner"),
  }, 200);

  const project = await expectStatus("owner creates project from approved applicant", {
    method: "post",
    url: `/api/projects/from-recruitment/${reviewRecruitmentId}`,
    headers: authHeaders("owner"),
    data: {
      title: `QA Kickoff ${Date.now()}`,
      resolution: "QA validates approved applicants can become project members.",
      start_date: "2026-05-12",
      end_date: "2026-06-12",
      memberUserIds: [approveTarget.user_id],
    },
  }, 201);
  const projectId = project.project_id;
  if (!projectId) {
    throw new Error("project conversion response did not include project_id");
  }

  const schedule = await expectStatus("owner creates project schedule", {
    method: "post",
    url: "/api/schedule/create",
    headers: authHeaders("owner"),
    data: {
      project_id: projectId,
      title: "QA kickoff schedule",
      description: "Created by mutation smoke.",
      date: "2026-05-20T10:00:00.000Z",
    },
  }, 201);
  const scheduleId = schedule.schedule_id;
  if (!scheduleId) {
    throw new Error("schedule response did not include schedule_id");
  }

  await expectStatus("owner updates project schedule", {
    method: "put",
    url: `/api/schedule/${scheduleId}`,
    headers: authHeaders("owner"),
    data: { title: "QA kickoff schedule updated" },
  }, 200);

  const meeting = await expectStatus("owner creates meeting note", {
    method: "post",
    url: `/api/projects/${projectId}/meetings`,
    headers: authHeaders("owner"),
    data: {
      title: "QA kickoff meeting",
      content: "Mutation smoke meeting note.",
      meeting_date: "2026-05-20T11:00:00.000Z",
    },
  }, 201);
  const meetingId = meeting.data?.meeting_id || meeting.meeting_id;
  if (!meetingId) {
    throw new Error("meeting response did not include meeting_id");
  }

  await expectStatus("owner updates meeting note", {
    method: "put",
    url: `/api/projects/${projectId}/meetings/${meetingId}`,
    headers: authHeaders("owner"),
    data: { title: "QA kickoff meeting updated" },
  }, 200);

  const review = await expectStatus("owner creates member review", {
    method: "post",
    url: "/api/reviews",
    headers: authHeaders("owner"),
    data: {
      project_id: projectId,
      reviewee_id: approveTarget.user_id,
      role_description: "QA participant",
      ability: 5,
      effort: 5,
      commitment: 5,
      communication: 5,
      reflection: 5,
      overall_rating: 5,
      comment: "QA mutation smoke review.",
    },
  }, 201);
  if (!review.review_id) {
    throw new Error("review response did not include review_id");
  }

  await expectStatus("owner reads project review summary", {
    method: "get",
    url: `/api/reviews/project/${projectId}/summary`,
    headers: authHeaders("owner"),
  }, 200);

  report.stateSnapshot = {
    namespace,
    personas: Object.fromEntries(
      ["owner", "applicant_a", "applicant_b", "member_a", "member_b"].map((personaKey) => {
        const persona = personaByKey(seed, personaKey) || {};
        const user = userByPersona[personaKey] || {};
        return [personaKey, {
          email: persona.email,
          username: user.username || persona.username,
          userId: userIdOf(user),
        }];
      }),
    ),
    ids: {
      ...seed.recruitments,
      ...seed.projects,
      mutationProjectId: projectId,
      approvedApplicantUserId: approveTarget.user_id,
      rejectedApplicantUserId: rejectTarget.user_id,
      scheduleId,
      meetingId,
      reviewId: review.review_id,
    },
    uiMatrix: [
      { persona: "owner", route: "/main", label: "owner-main" },
      { persona: "owner", route: "/project-management?tab=recruiting", label: "owner-recruiting" },
      { persona: "owner", route: "/recruitment/{reviewRecruitmentId}", label: "owner-review-recruitment" },
      { persona: "owner", route: "/project-management?tab=progress", label: "owner-progress" },
      { persona: "owner", route: "/project/{mutationProjectId}", label: "owner-mutation-project-detail" },
      { persona: "owner", route: "/project/{mutationProjectId}/proceedings", label: "owner-mutation-project-meetings" },
      { persona: "owner", route: "/project/{mutationProjectId}/calender", label: "owner-mutation-project-calendar" },
      { persona: "owner", route: "/evaluation/management", label: "owner-evaluation-management" },
      { persona: "applicant_a", route: "/team-matching", label: "applicant-a-team-matching" },
      { persona: "applicant_a", route: "/recruitment/{openRecruitmentId}", label: "applicant-a-open-recruitment" },
      { persona: "applicant_a", route: "/bookmark?tab=application", label: "applicant-a-application-history" },
      { persona: "member_a", route: "/main", label: "member-a-main" },
      { persona: "member_a", route: "/project-management?tab=progress", label: "member-a-progress" },
      { persona: "member_a", route: "/project/{activeProjectId}", label: "member-a-active-project-detail" },
      { persona: "member_a", route: "/project/{activeProjectId}/proceedings", label: "member-a-active-project-meetings" },
      { persona: "member_a", route: "/project/{activeProjectId}/calender", label: "member-a-active-project-calendar" },
      { persona: "member_a", route: "/project-management?tab=completed", label: "member-a-completed-projects" },
      { persona: "member_a", route: "/evaluation/project/{completedProjectId}", label: "member-a-received-evaluation" },
    ],
  };
};

(async () => {
  let seed;
  let runError;
  const shouldResetBefore = argv.resetBefore || argv["reset-before"];
  const shouldResetAfter = argv.resetAfter || argv["reset-after"];

  try {
    seed = shouldResetBefore ? seedPersonas() : loadSeedManifest();
    await runSmoke(seed);
  } catch (error) {
    runError = error;
    report.error = error.message;
  } finally {
    if (shouldResetAfter) {
      try {
        seedPersonas();
        report.metadata.resetAfterCompleted = true;
      } catch (error) {
        report.metadata.resetAfterCompleted = false;
        report.metadata.resetAfterError = error.message;
        runError = runError || error;
      }
    }

    writeReport();
    process.stdout.write(`REPORT:${outputPath}\n`);
    process.stdout.write(`SUMMARY:${JSON.stringify(report.summary)}\n`);

    if (runError) {
      process.exitCode = 1;
    }
  }
})();
