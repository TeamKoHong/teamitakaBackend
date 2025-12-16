const ProfileService = require("../services/profileService");
const { User } = require("../models");

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

/**
 * PUT /api/profile
 * 프로필 수정 (인증 필요)
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { major, teamExperience, keywords } = req.body;

        // 사용자 조회
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            });
        }

        // 업데이트할 필드 준비
        const updateData = {};

        // major 검증 및 업데이트
        if (major !== undefined) {
            if (typeof major !== "string" || major.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "학과는 100자 이하의 문자열이어야 합니다.",
                });
            }
            updateData.major = major;
        }

        // teamExperience 검증 및 업데이트
        if (teamExperience !== undefined) {
            const teamExpNum = parseInt(teamExperience, 10);
            if (isNaN(teamExpNum) || teamExpNum < 0 || teamExpNum > 99) {
                return res.status(400).json({
                    success: false,
                    message: "팀플 경험 횟수는 0-99 사이의 정수여야 합니다.",
                });
            }
            updateData.team_experience = teamExpNum;
        }

        // keywords 검증 및 업데이트
        if (keywords !== undefined) {
            if (!Array.isArray(keywords)) {
                return res.status(400).json({
                    success: false,
                    message: "키워드는 배열 형식이어야 합니다.",
                });
            }
            if (keywords.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: "키워드는 최대 10개까지 등록 가능합니다.",
                });
            }
            for (const keyword of keywords) {
                if (typeof keyword !== "string" || keyword.length > 20) {
                    return res.status(400).json({
                        success: false,
                        message: "각 키워드는 20자 이하의 문자열이어야 합니다.",
                    });
                }
            }
            updateData.keywords = keywords;
        }

        // 업데이트할 내용이 없는 경우
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "수정할 내용이 없습니다.",
            });
        }

        // 프로필 업데이트
        await user.update(updateData);

        // 업데이트된 사용자 정보 반환
        const updatedUser = await User.findByPk(userId, {
            attributes: {
                exclude: ["password"],
            },
        });

        return res.status(200).json({
            success: true,
            user: {
                userId: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email,
                university: updatedUser.university,
                major: updatedUser.major,
                teamExperience: updatedUser.team_experience,
                keywords: updatedUser.keywords || [],
                profileImage: updatedUser.avatar,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                awards: updatedUser.awards,
                portfolioUrl: updatedUser.portfolio_url,
            },
        });
    } catch (error) {
        console.error("❌ updateProfile Error:", error);
        return res.status(500).json({
            success: false,
            message: "프로필 수정 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
};

/**
 * GET /api/profile/me
 * 내 프로필 조회 (인증 필요)
 */
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId, {
            attributes: {
                exclude: ["password"],
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                university: user.university,
                major: user.major,
                teamExperience: user.team_experience,
                keywords: user.keywords || [],
                profileImage: user.avatar,
                bio: user.bio,
                skills: user.skills,
                awards: user.awards,
                portfolioUrl: user.portfolio_url,
            },
        });
    } catch (error) {
        console.error("❌ getMyProfile Error:", error);
        return res.status(500).json({
            success: false,
            message: "프로필 조회 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
};
