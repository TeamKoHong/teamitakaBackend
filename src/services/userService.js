const { User } = require("../models");

const getUsers = async () => {
  return await User.findAll();
};

const createUser = async ({ username, email, password }) => {
  // TODO: 비밀번호 해싱, 중복 체크 등
  return await User.create({ username, email, password });
};

const deleteUser = async (user_id) => {
  const user = await User.findByPk(user_id);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  await user.destroy();
  return { message: "사용자가 성공적으로 삭제되었습니다." };
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
};
