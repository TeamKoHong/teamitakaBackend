const { Profile, User, Project } = require("../models");

const getProfileByUserId = async (user_id) => {
  const profile = await Profile.findOne({
    where: { user_id },
    include: [{ model: User, attributes: ["email", "username"] }],
  });

  if (!profile) throw new Error("프로필을 찾을 수 없습니다.");
  return profile;
};

const createProfile = async (user_id, profileData) => {
  return await Profile.create({ user_id, ...profileData });
};

const updateProfile = async (profile_id, updates) => {
  const profile = await Profile.findByPk(profile_id);
  if (!profile) throw new Error("프로필을 찾을 수 없습니다.");
  await profile.update(updates);
  return profile;
};

const deleteProfile = async (profile_id) => {
  const profile = await Profile.findByPk(profile_id);
  if (!profile) throw new Error("프로필을 찾을 수 없습니다.");
  await profile.destroy();
};

const getResume = async (user_id) => {
  const profile = await getProfileByUserId(user_id);
  const projects = await Project.findAll({
    where: { user_id },
    attributes: ["title", "description", "start_date", "end_date", "role", "status"],
    order: [["start_date", "DESC"]],
  });

  return {
    profile: {
      nickname: profile.nickname,
      university: profile.university,
      major1: profile.major1,
      major2: profile.major2,
      skills: profile.skills,
      link: profile.link,
      awards: profile.awards,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      email: profile.User.email,
    },
    projects: projects || [],
  };
};

module.exports = {
  getProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
  getResume,
};
