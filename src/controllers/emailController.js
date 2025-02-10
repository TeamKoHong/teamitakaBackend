const emailService = require("../services/emailService");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await emailService.sendOtp(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const response = await emailService.verifyOtp(email, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
