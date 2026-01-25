const { Schedule } = require("../models");

const createSchedule = async (data) => {
  return await Schedule.create({
    project_id: data.project_id,
    title: data.title,
    description: data.description,
    date: data.date,
  });
};

const getSchedulesByProject = async (project_id) => {
  return await Schedule.findAll({ where: { project_id } });
};

const updateSchedule = async (schedule_id, data) => {
  return await Schedule.update(data, { where: { schedule_id } });
};

const deleteSchedule = async (schedule_id) => {
  return await Schedule.destroy({ where: { schedule_id } });
};

module.exports = { createSchedule, getSchedulesByProject, updateSchedule, deleteSchedule };
