const projectService = require("../services/projectService");
const { handleError } = require("../utils/errorHandler");

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    handleError(res, error);
  }
};

const getProjectById = async (req, res) => {
  try {
    const { project_id } = req.params;
    const project = await projectService.getProjectById(project_id);
    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }
    res.status(200).json(project);
  } catch (error) {
    handleError(res, error);
  }
};

const getCompletedProjects = async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;
    const completedProjects = await projectService.getCompletedProjects(user_id);
    res.status(200).json(completedProjects);
  } catch (error) {
    handleError(res, error);
  }
};

const updateProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const updatedProject = await projectService.updateProject(project_id, req.body);
    if (!updatedProject) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    await projectService.deleteProject(project_id);
    res.status(200).json({ message: "프로젝트가 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  getCompletedProjects,
  updateProject,
  deleteProject,
};
