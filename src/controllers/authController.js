const { validatePassword } = require("../utils/passwordValidator");

exports.validatePassword = (req, res) => {
    const { password } = req.body;

    const validationResult = validatePassword(password);

    return res.json(validationResult);
};
