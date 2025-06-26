const { User, Review, Project, ProjectMembers } = require("../models");

class ProfileService {
    async getProfileData(user_id) {
        const user = await User.findOne({
            where: { user_id },
            attributes: ["user_id", "username", "university", "major", "avatar", "bio", "skills", "portfolio_url"]
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    async getUserRatings(user_id) {
        const reviews = await Review.findAll({
            where: { reviewee_id: user_id },
            attributes: ["ability", "effort", "commitment", "communication", "reflection"]
        });

        if (reviews.length === 0) return null;

        const total = { ability: 0, effort: 0, commitment: 0, communication: 0, reflection: 0 };
        reviews.forEach(review => {
            total.ability += review.ability;
            total.effort += review.effort;
            total.commitment += review.commitment;
            total.communication += review.communication;
            total.reflection += review.reflection;
        });

        const count = reviews.length;
        return {
            ability: (total.ability / count).toFixed(1),
            effort: (total.effort / count).toFixed(1),
            commitment: (total.commitment / count).toFixed(1),
            communication: (total.communication / count).toFixed(1),
            reflection: (total.reflection / count).toFixed(1)
        };
    }

    async getUserProjects(user_id) {
        return await Project.findAll({
            include: [{
                model: ProjectMembers,
                where: { user_id },
                required: true
            }],
            attributes: ["project_id", "title", "description", "createdAt"]
        });
    }
}

module.exports = new ProfileService();
