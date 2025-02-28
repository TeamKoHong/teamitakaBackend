const ProfileService = require("../services/profileService");

exports.getUserProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const profile = await ProfileService.getProfileData(user_id);
        res.status(200).json(profile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUserRatings = async (req, res) => {
    try {
        const { user_id } = req.params;
        const ratings = await ProfileService.getUserRatings(user_id);
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const { user_id } = req.params;
        const projects = await ProfileService.getUserProjects(user_id);
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
