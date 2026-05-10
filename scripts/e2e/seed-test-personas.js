#!/usr/bin/env node

/**
 * Creates cleanup-safe E2E personas and baseline user-flow data.
 *
 * Usage:
 *   node scripts/e2e/seed-test-personas.js status
 *   node scripts/e2e/seed-test-personas.js up
 *   node scripts/e2e/seed-test-personas.js down
 *
 * Production/shared DB guard:
 *   TEAMITAKA_E2E_ALLOW_PRODUCTION=1 node scripts/e2e/seed-test-personas.js up --confirm-production
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Sequelize, Op } = require("sequelize");
const { buildDatabaseConfig, hasRequiredDatabaseConfig } = require("../../src/config/databaseConfig");

const DEFAULT_NAMESPACE = process.env.TEAMITAKA_E2E_NAMESPACE || "e2e_20260510";
const DEFAULT_PASSWORD = process.env.TEAMITAKA_E2E_PASSWORD || "TeamitakaE2E!2026";
const EMAIL_DOMAIN = process.env.TEAMITAKA_E2E_EMAIL_DOMAIN || "test.teamitaka.local";
const UNIVERSITY = process.env.TEAMITAKA_E2E_UNIVERSITY || "고려대학교";
const MAJOR = process.env.TEAMITAKA_E2E_MAJOR || "컴퓨터융합소프트웨어학과";

const argv = process.argv.slice(2);
const command = argv.find((arg) => !arg.startsWith("--")) || "status";
const confirmProduction = argv.includes("--confirm-production");
const namespaceArg = argv.find((arg) => arg.startsWith("--namespace="));
const namespace = namespaceArg ? namespaceArg.split("=")[1] : DEFAULT_NAMESPACE;
const isJson = argv.includes("--json");

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const PERSONAS = [
  { key: "owner", username: "E2E 오너", roleLabel: "프로젝트 리더", keywords: ["리더", "기획"] },
  { key: "applicant_a", username: "E2E 지원자A", roleLabel: "프론트엔드 지원자", keywords: ["프론트엔드", "React"] },
  { key: "applicant_b", username: "E2E 지원자B", roleLabel: "백엔드 지원자", keywords: ["백엔드", "API"] },
  { key: "member_a", username: "E2E 팀원A", roleLabel: "프론트엔드", keywords: ["UI", "웹"] },
  { key: "member_b", username: "E2E 팀원B", roleLabel: "백엔드", keywords: ["DB", "서버"] },
];

const titlePrefix = `[E2E ${namespace}]`;

const json = (value) => JSON.stringify(value, null, 2);

const buildEmail = (key) => `${namespace}_${key}@${EMAIL_DOMAIN}`;

const buildUsername = (persona) => `${namespace}_${persona.key}`;

const assertSafeNamespace = () => {
  if (!/^[a-zA-Z0-9_-]{6,40}$/.test(namespace)) {
    throw new Error(`Unsafe namespace: ${namespace}`);
  }
  if (!namespace.startsWith("e2e_")) {
    throw new Error(`Namespace must start with "e2e_": ${namespace}`);
  }
};

const assertProductionAllowed = () => {
  if (!isProduction) return;
  if (process.env.TEAMITAKA_E2E_ALLOW_PRODUCTION !== "1" || !confirmProduction) {
    throw new Error(
      "Refusing to mutate production DB. Set TEAMITAKA_E2E_ALLOW_PRODUCTION=1 and pass --confirm-production."
    );
  }
};

const createSequelize = () => {
  const config = buildDatabaseConfig(env);
  if (!hasRequiredDatabaseConfig(config)) {
    throw new Error(`Missing required database config for ${env}`);
  }

  return new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    define: config.define,
    logging: false,
    pool: { max: 2, min: 0, acquire: 30000, idle: 5000 },
  });
};

const loadModels = (sequelize) => {
  const DataTypes = Sequelize.DataTypes;
  return {
    Application: require("../../src/models/Application")(sequelize, DataTypes),
    Hashtag: require("../../src/models/Hashtag")(sequelize, DataTypes),
    MeetingNotes: require("../../src/models/MeetingNotes")(sequelize, DataTypes),
    Project: require("../../src/models/Project")(sequelize, DataTypes),
    ProjectMembers: require("../../src/models/ProjectMembers")(sequelize, DataTypes),
    Recruitment: require("../../src/models/Recruitment")(sequelize, DataTypes),
    Review: require("../../src/models/Review")(sequelize, DataTypes),
    Schedule: require("../../src/models/Schedule")(sequelize, DataTypes),
    Todo: require("../../src/models/Todo")(sequelize, DataTypes),
    User: require("../../src/models/User")(sequelize, DataTypes),
  };
};

const getPersonaWhere = () => ({
  email: { [Op.in]: PERSONAS.map((persona) => buildEmail(persona.key)) },
});

const findPersonaUsers = async (models, transaction) => {
  const users = await models.User.findAll({
    where: getPersonaWhere(),
    transaction,
  });
  return Object.fromEntries(users.map((user) => [user.email, user]));
};

const destroyNamespaceData = async (sequelize, models, transaction) => {
  const users = await models.User.findAll({
    where: getPersonaWhere(),
    attributes: ["user_id"],
    transaction,
  });
  const userIds = users.map((user) => user.user_id);

  const projects = await models.Project.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `${titlePrefix}%` } },
        ...(userIds.length ? [{ user_id: { [Op.in]: userIds } }] : []),
      ],
    },
    attributes: ["project_id"],
    transaction,
  });
  const projectIds = projects.map((project) => project.project_id);

  const recruitments = await models.Recruitment.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `${titlePrefix}%` } },
        ...(userIds.length ? [{ user_id: { [Op.in]: userIds } }] : []),
        ...(projectIds.length ? [{ project_id: { [Op.in]: projectIds } }] : []),
      ],
    },
    attributes: ["recruitment_id"],
    transaction,
  });
  const recruitmentIds = recruitments.map((recruitment) => recruitment.recruitment_id);

  await models.Review.destroy({
    where: {
      [Op.or]: [
        ...(projectIds.length ? [{ project_id: { [Op.in]: projectIds } }] : []),
        ...(userIds.length ? [{ reviewer_id: { [Op.in]: userIds } }, { reviewee_id: { [Op.in]: userIds } }] : []),
      ],
    },
    transaction,
  });

  await models.Application.destroy({
    where: {
      [Op.or]: [
        ...(recruitmentIds.length ? [{ recruitment_id: { [Op.in]: recruitmentIds } }] : []),
        ...(userIds.length ? [{ user_id: { [Op.in]: userIds } }] : []),
      ],
    },
    transaction,
  });

  await sequelize.query(
    "DELETE FROM application_portfolios WHERE application_id NOT IN (SELECT application_id FROM applications)",
    { transaction }
  ).catch(() => {});

  for (const model of [models.Todo, models.MeetingNotes, models.Schedule, models.ProjectMembers]) {
    if (!projectIds.length) continue;
    await model.destroy({
      where: { project_id: { [Op.in]: projectIds } },
      transaction,
    });
  }

  if (recruitmentIds.length) {
    await sequelize.query("DELETE FROM recruitment_hashtags WHERE recruitment_id IN (:ids)", {
      replacements: { ids: recruitmentIds },
      transaction,
    }).catch(() => {});
    await sequelize.query("DELETE FROM recruitment_views WHERE recruitment_id IN (:ids)", {
      replacements: { ids: recruitmentIds },
      transaction,
    }).catch(() => {});
    await sequelize.query("DELETE FROM scraps WHERE recruitment_id IN (:ids)", {
      replacements: { ids: recruitmentIds },
      transaction,
    }).catch(() => {});
    await sequelize.query("DELETE FROM comments WHERE recruitment_id IN (:ids)", {
      replacements: { ids: recruitmentIds },
      transaction,
    }).catch(() => {});
  }

  if (projectIds.length) {
    await sequelize.query("DELETE FROM scraps WHERE project_id IN (:ids)", {
      replacements: { ids: projectIds },
      transaction,
    }).catch(() => {});
  }

  await models.Recruitment.destroy({
    where: { recruitment_id: { [Op.in]: recruitmentIds.length ? recruitmentIds : ["00000000-0000-0000-0000-000000000000"] } },
    transaction,
  });

  await models.Project.destroy({
    where: { project_id: { [Op.in]: projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"] } },
    transaction,
  });

  if (userIds.length) {
    await sequelize.query("DELETE FROM notifications WHERE user_id IN (:ids)", {
      replacements: { ids: userIds },
      transaction,
    }).catch(() => {});
    await sequelize.query("DELETE FROM device_tokens WHERE user_id IN (:ids)", {
      replacements: { ids: userIds },
      transaction,
    }).catch(() => {});
  }

  await models.User.destroy({
    where: getPersonaWhere(),
    transaction,
  });
};

const linkRecruitmentHashtags = async (sequelize, models, recruitment, names, transaction) => {
  const dialect = sequelize.getDialect();
  for (const name of names) {
    const [hashtag] = await models.Hashtag.findOrCreate({
      where: { name },
      defaults: { name },
      transaction,
    });

    if (dialect === "postgres") {
      await sequelize.query(
        `INSERT INTO recruitment_hashtags (recruitment_id, hashtag_id, created_at, updated_at)
         VALUES (:recruitmentId, :hashtagId, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        {
          replacements: {
            recruitmentId: recruitment.recruitment_id,
            hashtagId: hashtag.hashtag_id,
          },
          transaction,
        }
      );
      continue;
    }

    await sequelize.query(
      "INSERT IGNORE INTO recruitment_hashtags (recruitment_id, hashtag_id, created_at, updated_at) VALUES (:recruitmentId, :hashtagId, NOW(), NOW())",
      {
        replacements: {
          recruitmentId: recruitment.recruitment_id,
          hashtagId: hashtag.hashtag_id,
        },
        transaction,
      }
    );
  }
};

const createUsers = async (models, transaction) => {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const now = new Date();
  const created = {};

  for (const persona of PERSONAS) {
    const user = await models.User.create({
      username: buildUsername(persona),
      email: buildEmail(persona.key),
      password: passwordHash,
      role: "MEMBER",
      university: UNIVERSITY,
      major: MAJOR,
      department: MAJOR,
      enrollment_status: "재학 중",
      phone_number: `+8210${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      phone_verified: true,
      phone_verified_at: now,
      email_verified_at: now,
      name: persona.username,
      bio: `${titlePrefix} ${persona.roleLabel} 테스트 계정`,
      skills: persona.key.includes("owner") ? "기획, 리더십, 커뮤니케이션" : "React, API, 협업",
      keywords: persona.key.includes("owner") ? ["리더", "기획"] : persona.key.includes("applicant") ? ["지원", "협업"] : ["팀원", "개발"],
      team_experience: persona.key === "owner" ? 3 : 1,
      marketing_agreed: false,
      third_party_agreed: false,
    }, { transaction });

    created[persona.key] = user;
  }

  return created;
};

const addProjectMembers = async (models, project, members, transaction) => {
  for (const member of members) {
    await models.ProjectMembers.create({
      project_id: project.project_id,
      user_id: member.user.user_id,
      role: member.role,
      task: member.task || null,
      joined_at: new Date(),
    }, { transaction });
  }
};

const createBaselineData = async (sequelize, models, users, transaction) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const openRecruitment = await models.Recruitment.create({
    title: `${titlePrefix} 지원 가능 모집`,
    description: "지원테스트",
    status: "ACTIVE",
    user_id: users.owner.user_id,
    max_applicants: 3,
    recruitment_start: oneWeekAgo,
    recruitment_end: twoWeeksLater,
    project_type: "side",
    views: 12,
    scrap_count: 0,
  }, { transaction });
  await linkRecruitmentHashtags(sequelize, models, openRecruitment, [`${namespace}_apply`, "E2E"], transaction);

  const reviewRecruitment = await models.Recruitment.create({
    title: `${titlePrefix} 지원자 확인 모집`,
    description: "선정테스트",
    status: "ACTIVE",
    user_id: users.owner.user_id,
    max_applicants: 4,
    recruitment_start: oneWeekAgo,
    recruitment_end: twoWeeksLater,
    project_type: "course",
    views: 25,
    scrap_count: 1,
  }, { transaction });
  await linkRecruitmentHashtags(sequelize, models, reviewRecruitment, [`${namespace}_select`, "E2E"], transaction);

  await models.Application.bulkCreate([
    {
      recruitment_id: reviewRecruitment.recruitment_id,
      user_id: users.applicant_a.user_id,
      status: "PENDING",
      introduction: `${titlePrefix} applicant_a pending application`,
    },
    {
      recruitment_id: reviewRecruitment.recruitment_id,
      user_id: users.applicant_b.user_id,
      status: "PENDING",
      introduction: `${titlePrefix} applicant_b pending application`,
    },
  ], { transaction });

  const activeProject = await models.Project.create({
    title: `${titlePrefix} 진행 프로젝트`,
    description: "E2E 진행 프로젝트 workspace smoke data",
    user_id: users.owner.user_id,
    start_date: oneWeekAgo,
    end_date: twoWeeksLater,
    status: "ACTIVE",
    project_type: "side",
    meeting_time: "매주 수요일 19:00",
    resolution: "주간 스프린트로 진행",
  }, { transaction });

  await addProjectMembers(models, activeProject, [
    { user: users.owner, role: "LEADER", task: "기획/관리" },
    { user: users.member_a, role: "FRONTEND", task: "화면 구현" },
    { user: users.member_b, role: "BACKEND", task: "API 구현" },
  ], transaction);

  await models.Todo.bulkCreate([
    {
      project_id: activeProject.project_id,
      user_id: users.member_a.user_id,
      title: `${titlePrefix} 홈 화면 QA`,
      description: "Figma 기준 spacing 확인",
      status: "PENDING",
      priority: "HIGH",
      due_date: twoWeeksLater,
    },
    {
      project_id: activeProject.project_id,
      user_id: users.member_b.user_id,
      title: `${titlePrefix} API 계약 확인`,
      description: "projects/recruitments/reviews preflight",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      due_date: twoWeeksLater,
    },
  ], { transaction });

  await models.MeetingNotes.create({
    project_id: activeProject.project_id,
    created_by: users.owner.user_id,
    title: `${titlePrefix} 킥오프 회의`,
    content: "테스트 하네스 기준으로 실제 사용자 플로우를 점검한다.",
    meeting_date: now,
  }, { transaction });

  await models.Schedule.create({
    project_id: activeProject.project_id,
    title: `${titlePrefix} 1차 QA`,
    description: "iOS simulator multi-persona smoke",
    date: twoWeeksLater,
    created_by: users.owner.user_id,
  }, { transaction });

  const completedProject = await models.Project.create({
    title: `${titlePrefix} 완료 평가 프로젝트`,
    description: "E2E 상호평가 smoke data",
    user_id: users.owner.user_id,
    start_date: oneMonthAgo,
    end_date: yesterday,
    status: "COMPLETED",
    project_type: "course",
    meeting_time: "종료",
    resolution: "완료 후 상호평가 진행",
  }, { transaction });

  await addProjectMembers(models, completedProject, [
    { user: users.owner, role: "LEADER", task: "기획/관리" },
    { user: users.member_a, role: "FRONTEND", task: "화면 구현" },
    { user: users.member_b, role: "BACKEND", task: "API 구현" },
  ], transaction);

  await sequelize.query(
    `INSERT INTO reviews (
      project_id, reviewer_id, reviewee_id, role_description,
      ability, effort, commitment, communication, reflection, overall_rating,
      comment, created_at, updated_at
    ) VALUES
    (
      :projectId, :ownerId, :memberAId, '프론트엔드 구현',
      5, 5, 4, 5, 4, 5,
      '테스트 데이터: owner가 member_a에게 남긴 평가', NOW(), NOW()
    ),
    (
      :projectId, :memberAId, :ownerId, '프로젝트 리딩',
      5, 5, 5, 5, 4, 5,
      '테스트 데이터: member_a가 owner에게 남긴 평가', NOW(), NOW()
    )`,
    {
      replacements: {
        projectId: completedProject.project_id,
        ownerId: users.owner.user_id,
        memberAId: users.member_a.user_id,
      },
      transaction,
    }
  );

  return {
    recruitments: {
      openRecruitmentId: openRecruitment.recruitment_id,
      reviewRecruitmentId: reviewRecruitment.recruitment_id,
    },
    projects: {
      activeProjectId: activeProject.project_id,
      completedProjectId: completedProject.project_id,
    },
  };
};

const writeManifest = (payload) => {
  const reportsDir = path.resolve(__dirname, "../../reports/e2e-personas");
  fs.mkdirSync(reportsDir, { recursive: true });
  const file = path.join(reportsDir, `${namespace}.json`);
  fs.writeFileSync(file, `${json(payload)}\n`);
  return file;
};

const commandStatus = async (models, transaction) => {
  const users = await models.User.findAll({
    where: getPersonaWhere(),
    attributes: ["email", "username", "user_id", "university", "email_verified_at", "phone_verified"],
    transaction,
  });
  const projects = await models.Project.findAll({
    where: { title: { [Op.like]: `${titlePrefix}%` } },
    attributes: ["project_id", "title", "status"],
    transaction,
  });
  const recruitments = await models.Recruitment.findAll({
    where: { title: { [Op.like]: `${titlePrefix}%` } },
    attributes: ["recruitment_id", "title", "status"],
    transaction,
  });
  return {
    namespace,
    env,
    users: users.map((user) => user.get({ plain: true })),
    projects: projects.map((project) => project.get({ plain: true })),
    recruitments: recruitments.map((recruitment) => recruitment.get({ plain: true })),
  };
};

const commandUp = async (sequelize, models, transaction) => {
  await destroyNamespaceData(sequelize, models, transaction);
  const users = await createUsers(models, transaction);
  const data = await createBaselineData(sequelize, models, users, transaction);
  return {
    namespace,
    env,
    password: DEFAULT_PASSWORD,
    personas: PERSONAS.map((persona) => ({
      key: persona.key,
      email: buildEmail(persona.key),
      username: buildUsername(persona),
      roleLabel: persona.roleLabel,
    })),
    ...data,
  };
};

const main = async () => {
  assertSafeNamespace();
  if (!["status", "up", "down"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  if (command !== "status") {
    assertProductionAllowed();
  }

  const sequelize = createSequelize();
  const models = loadModels(sequelize);

  try {
    await sequelize.authenticate();

    let result;
    await sequelize.transaction(async (transaction) => {
      if (command === "status") {
        result = await commandStatus(models, transaction);
        return;
      }

      if (command === "down") {
        await destroyNamespaceData(sequelize, models, transaction);
        result = { namespace, env, removed: true };
        return;
      }

      result = await commandUp(sequelize, models, transaction);
    });

    if (command === "up") {
      result.manifestPath = writeManifest(result);
    }

    if (isJson) {
      console.log(json(result));
    } else {
      console.log(`[teamitaka-e2e] ${command} complete`);
      console.log(json(result));
    }
  } finally {
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error(`[teamitaka-e2e] ${command} failed: ${error.message}`);
  process.exitCode = 1;
});
