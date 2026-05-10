#!/usr/bin/env node

/**
 * Supabase service-key fallback for E2E persona seeding.
 *
 * This is for production-like deployed backends when direct DB password auth is
 * unavailable locally. It only touches rows under the selected e2e namespace.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const argv = process.argv.slice(2);
const command = argv.find((arg) => !arg.startsWith("--")) || "status";
const namespace = (argv.find((arg) => arg.startsWith("--namespace=")) || "").split("=")[1] ||
  process.env.TEAMITAKA_E2E_NAMESPACE ||
  "e2e_20260510";
const confirmProduction = argv.includes("--confirm-production");
const isJson = argv.includes("--json");
const password = process.env.TEAMITAKA_E2E_PASSWORD || "TeamitakaE2E!2026";
const emailDomain = process.env.TEAMITAKA_E2E_EMAIL_DOMAIN || "test.teamitaka.local";
const titlePrefix = `[E2E ${namespace}]`;

const personas = [
  { key: "owner", displayName: "E2E 오너", roleLabel: "프로젝트 리더" },
  { key: "applicant_a", displayName: "E2E 지원자A", roleLabel: "프론트엔드 지원자" },
  { key: "applicant_b", displayName: "E2E 지원자B", roleLabel: "백엔드 지원자" },
  { key: "member_a", displayName: "E2E 팀원A", roleLabel: "프론트엔드" },
  { key: "member_b", displayName: "E2E 팀원B", roleLabel: "백엔드" },
];

const now = () => new Date().toISOString();
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const id = () => crypto.randomUUID();
const emailFor = (key) => `${namespace}_${key}@${emailDomain}`;
const usernameFor = (key) => `${namespace}_${key}`;
const json = (value) => JSON.stringify(value, null, 2);

const assertSafe = () => {
  if (!["status", "up", "down"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  if (!/^e2e_[a-zA-Z0-9_-]{3,36}$/.test(namespace)) {
    throw new Error(`Unsafe namespace: ${namespace}`);
  }
  if (command !== "status") {
    if (process.env.NODE_ENV === "production" && (!confirmProduction || process.env.TEAMITAKA_E2E_ALLOW_PRODUCTION !== "1")) {
      throw new Error("Refusing production mutation without TEAMITAKA_E2E_ALLOW_PRODUCTION=1 and --confirm-production.");
    }
  }
};

const createSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
  return createClient(url, key, { auth: { persistSession: false } });
};

const queryAll = async (supabase, table, columns, filters = (q) => q) => {
  const { data, error } = await filters(supabase.from(table).select(columns));
  if (error) throw new Error(`${table} select failed: ${error.message}`);
  return data || [];
};

const safeDelete = async (supabase, table, column, values) => {
  if (!values.length) return;
  const { error } = await supabase.from(table).delete().in(column, values);
  if (error && !/does not exist|Could not find/i.test(error.message)) {
    throw new Error(`${table} delete failed: ${error.message}`);
  }
};

const insertRows = async (supabase, table, rows) => {
  if (!rows.length) return [];
  const { data, error } = await supabase.from(table).insert(rows).select("*");
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return data || [];
};

const findNamespaceData = async (supabase) => {
  const emails = personas.map((persona) => emailFor(persona.key));
  const users = await queryAll(supabase, "users", "user_id,email,username,university", (q) => q.in("email", emails));
  const userIds = users.map((user) => user.user_id);

  const projectsByTitle = await queryAll(supabase, "projects", "project_id,title,status,user_id", (q) => q.ilike("title", `${titlePrefix}%`));
  const projectsByUser = userIds.length
    ? await queryAll(supabase, "projects", "project_id,title,status,user_id", (q) => q.in("user_id", userIds))
    : [];
  const projects = [...new Map([...projectsByTitle, ...projectsByUser].map((project) => [project.project_id, project])).values()];
  const projectIds = projects.map((project) => project.project_id);

  const recruitmentsByTitle = await queryAll(supabase, "recruitments", "recruitment_id,title,status,user_id,project_id", (q) => q.ilike("title", `${titlePrefix}%`));
  const recruitmentsByUser = userIds.length
    ? await queryAll(supabase, "recruitments", "recruitment_id,title,status,user_id,project_id", (q) => q.in("user_id", userIds))
    : [];
  const recruitmentsByProject = projectIds.length
    ? await queryAll(supabase, "recruitments", "recruitment_id,title,status,user_id,project_id", (q) => q.in("project_id", projectIds))
    : [];
  const recruitments = [...new Map([...recruitmentsByTitle, ...recruitmentsByUser, ...recruitmentsByProject].map((row) => [row.recruitment_id, row])).values()];

  return {
    users,
    userIds,
    projects,
    projectIds,
    recruitments,
    recruitmentIds: recruitments.map((recruitment) => recruitment.recruitment_id),
  };
};

const cleanup = async (supabase) => {
  const state = await findNamespaceData(supabase);

  await safeDelete(supabase, "reviews", "project_id", state.projectIds);
  await safeDelete(supabase, "reviews", "reviewer_id", state.userIds);
  await safeDelete(supabase, "reviews", "reviewee_id", state.userIds);

  const appsByRecruitment = state.recruitmentIds.length
    ? await queryAll(supabase, "applications", "application_id", (q) => q.in("recruitment_id", state.recruitmentIds))
    : [];
  const appsByUser = state.userIds.length
    ? await queryAll(supabase, "applications", "application_id", (q) => q.in("user_id", state.userIds))
    : [];
  const applicationIds = [...new Set([...appsByRecruitment, ...appsByUser].map((app) => app.application_id))];
  await safeDelete(supabase, "application_portfolios", "application_id", applicationIds);
  await safeDelete(supabase, "applications", "application_id", applicationIds);

  await safeDelete(supabase, "todos", "project_id", state.projectIds);
  await safeDelete(supabase, "meeting_notes", "project_id", state.projectIds);
  await safeDelete(supabase, "schedules", "project_id", state.projectIds);
  await safeDelete(supabase, "project_members", "project_id", state.projectIds);
  await safeDelete(supabase, "project_members", "user_id", state.userIds);

  await safeDelete(supabase, "recruitment_hashtags", "recruitment_id", state.recruitmentIds);
  await safeDelete(supabase, "recruitment_views", "recruitment_id", state.recruitmentIds);
  await safeDelete(supabase, "scraps", "recruitment_id", state.recruitmentIds);
  await safeDelete(supabase, "comments", "recruitment_id", state.recruitmentIds);
  await safeDelete(supabase, "scraps", "project_id", state.projectIds);
  await safeDelete(supabase, "recruitments", "recruitment_id", state.recruitmentIds);

  await safeDelete(supabase, "projects", "project_id", state.projectIds);
  await safeDelete(supabase, "notifications", "user_id", state.userIds);
  await safeDelete(supabase, "device_tokens", "user_id", state.userIds);
  await safeDelete(supabase, "users", "user_id", state.userIds);
};

const seed = async (supabase) => {
  await cleanup(supabase);

  const passwordHash = await bcrypt.hash(password, 10);
  const userRows = personas.map((persona, index) => ({
    user_id: id(),
    username: usernameFor(persona.key),
    email: emailFor(persona.key),
    password: passwordHash,
    role: "MEMBER",
    university: "고려대학교",
    major: "컴퓨터융합소프트웨어학과",
    department: "컴퓨터융합소프트웨어학과",
    email_verified_at: now(),
    phone_number: `+82109990${String(index + 1).padStart(4, "0")}`,
    phone_verified: true,
    phone_verified_at: now(),
    team_experience: persona.key === "owner" ? 3 : 1,
    keywords: persona.key === "owner" ? ["리더", "기획"] : ["협업", "개발"],
    enrollment_status: "재학 중",
    name: persona.displayName,
    bio: `${titlePrefix} ${persona.roleLabel}`,
    marketing_agreed: false,
    third_party_agreed: false,
    created_at: now(),
    updated_at: now(),
  }));
  await insertRows(supabase, "users", userRows);
  const users = Object.fromEntries(userRows.map((user) => [user.email.split("_").slice(2).join("_").split("@")[0], user]));
  users.owner = userRows.find((user) => user.email === emailFor("owner"));
  users.applicant_a = userRows.find((user) => user.email === emailFor("applicant_a"));
  users.applicant_b = userRows.find((user) => user.email === emailFor("applicant_b"));
  users.member_a = userRows.find((user) => user.email === emailFor("member_a"));
  users.member_b = userRows.find((user) => user.email === emailFor("member_b"));

  const openRecruitmentId = id();
  const reviewRecruitmentId = id();
  await insertRows(supabase, "recruitments", [
    {
      recruitment_id: openRecruitmentId,
      title: `${titlePrefix} 지원 가능 모집`,
      description: "지원테스트",
      status: "ACTIVE",
      user_id: users.owner.user_id,
      max_applicants: 3,
      recruitment_start: daysFromNow(-7),
      recruitment_end: daysFromNow(14),
      project_type: "side",
      views: 12,
      scrap_count: 0,
      created_at: now(),
      updated_at: now(),
    },
    {
      recruitment_id: reviewRecruitmentId,
      title: `${titlePrefix} 지원자 확인 모집`,
      description: "선정테스트",
      status: "ACTIVE",
      user_id: users.owner.user_id,
      max_applicants: 4,
      recruitment_start: daysFromNow(-7),
      recruitment_end: daysFromNow(14),
      project_type: "course",
      views: 25,
      scrap_count: 1,
      created_at: now(),
      updated_at: now(),
    },
  ]);

  await insertRows(supabase, "applications", [
    {
      application_id: id(),
      recruitment_id: reviewRecruitmentId,
      user_id: users.applicant_a.user_id,
      status: "PENDING",
      introduction: `${titlePrefix} applicant_a pending application`,
      created_at: now(),
      updated_at: now(),
    },
    {
      application_id: id(),
      recruitment_id: reviewRecruitmentId,
      user_id: users.applicant_b.user_id,
      status: "PENDING",
      introduction: `${titlePrefix} applicant_b pending application`,
      created_at: now(),
      updated_at: now(),
    },
  ]);

  const activeProjectId = id();
  const completedProjectId = id();
  await insertRows(supabase, "projects", [
    {
      project_id: activeProjectId,
      title: `${titlePrefix} 진행 프로젝트`,
      description: "E2E 진행 프로젝트 workspace smoke data",
      user_id: users.owner.user_id,
      start_date: daysFromNow(-7),
      end_date: daysFromNow(14),
      status: "ACTIVE",
      project_type: "side",
      meeting_time: "매주 수요일 19:00",
      resolution: "주간 스프린트로 진행",
      created_at: now(),
      updated_at: now(),
    },
    {
      project_id: completedProjectId,
      title: `${titlePrefix} 완료 평가 프로젝트`,
      description: "E2E 상호평가 smoke data",
      user_id: users.owner.user_id,
      start_date: daysFromNow(-30),
      end_date: daysFromNow(-1),
      status: "COMPLETED",
      project_type: "course",
      meeting_time: "종료",
      resolution: "완료 후 상호평가 진행",
      created_at: now(),
      updated_at: now(),
    },
  ]);

  const projectMemberRows = [
    [activeProjectId, users.owner, "LEADER", "기획/관리"],
    [activeProjectId, users.member_a, "FRONTEND", "화면 구현"],
    [activeProjectId, users.member_b, "BACKEND", "API 구현"],
    [completedProjectId, users.owner, "LEADER", "기획/관리"],
    [completedProjectId, users.member_a, "FRONTEND", "화면 구현"],
    [completedProjectId, users.member_b, "BACKEND", "API 구현"],
  ].map(([projectId, user, role, task]) => ({
    id: id(),
    project_id: projectId,
    user_id: user.user_id,
    role,
    task,
    joined_at: daysFromNow(-7),
    created_at: now(),
    updated_at: now(),
  }));
  await insertRows(supabase, "project_members", projectMemberRows);

  await insertRows(supabase, "todos", [
    {
      todo_id: id(),
      project_id: activeProjectId,
      user_id: users.member_a.user_id,
      title: `${titlePrefix} 홈 화면 QA`,
      description: "Figma 기준 spacing 확인",
      status: "PENDING",
      priority: "HIGH",
      due_date: daysFromNow(14),
      created_at: now(),
      updated_at: now(),
    },
    {
      todo_id: id(),
      project_id: activeProjectId,
      user_id: users.member_b.user_id,
      title: `${titlePrefix} API 계약 확인`,
      description: "projects/recruitments/reviews preflight",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      due_date: daysFromNow(14),
      created_at: now(),
      updated_at: now(),
    },
  ]);

  await insertRows(supabase, "meeting_notes", [
    {
      meeting_id: id(),
      project_id: activeProjectId,
      created_by: users.owner.user_id,
      title: `${titlePrefix} 킥오프 회의`,
      content: "테스트 하네스 기준으로 실제 사용자 플로우를 점검한다.",
      meeting_date: now(),
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  await insertRows(supabase, "schedules", [
    {
      schedule_id: id(),
      project_id: activeProjectId,
      title: `${titlePrefix} 1차 QA`,
      description: "iOS simulator multi-persona smoke",
      date: daysFromNow(14),
      created_by: users.owner.user_id,
      created_at: now(),
      updated_at: now(),
    },
  ]);

  await insertRows(supabase, "reviews", [
    {
      review_id: id(),
      project_id: completedProjectId,
      reviewer_id: users.owner.user_id,
      reviewee_id: users.member_a.user_id,
      role_description: "프론트엔드 구현",
      ability: 5,
      effort: 5,
      commitment: 4,
      communication: 5,
      reflection: 4,
      overall_rating: 5,
      comment: "테스트 데이터: owner가 member_a에게 남긴 평가",
      created_at: now(),
      updated_at: now(),
    },
    {
      review_id: id(),
      project_id: completedProjectId,
      reviewer_id: users.member_a.user_id,
      reviewee_id: users.owner.user_id,
      role_description: "프로젝트 리딩",
      ability: 5,
      effort: 5,
      commitment: 5,
      communication: 5,
      reflection: 4,
      overall_rating: 5,
      comment: "테스트 데이터: member_a가 owner에게 남긴 평가",
      created_at: now(),
      updated_at: now(),
    },
  ]);

  const result = {
    namespace,
    password,
    personas: personas.map((persona) => ({
      key: persona.key,
      email: emailFor(persona.key),
      username: usernameFor(persona.key),
      roleLabel: persona.roleLabel,
    })),
    recruitments: { openRecruitmentId, reviewRecruitmentId },
    projects: { activeProjectId, completedProjectId },
  };

  const reportsDir = path.resolve(__dirname, "../../reports/e2e-personas");
  fs.mkdirSync(reportsDir, { recursive: true });
  result.manifestPath = path.join(reportsDir, `${namespace}.supabase.json`);
  fs.writeFileSync(result.manifestPath, `${json(result)}\n`);
  return result;
};

const main = async () => {
  assertSafe();
  const supabase = createSupabase();
  let result;

  if (command === "status") {
    result = { namespace, ...(await findNamespaceData(supabase)) };
  } else if (command === "down") {
    await cleanup(supabase);
    result = { namespace, removed: true };
  } else {
    result = await seed(supabase);
  }

  if (isJson) {
    console.log(json(result));
  } else {
    console.log(`[teamitaka-e2e-supabase] ${command} complete`);
    console.log(json(result));
  }
};

main().catch((error) => {
  console.error(`[teamitaka-e2e-supabase] ${command} failed: ${error.message}`);
  process.exitCode = 1;
});
