import { sendEmailService } from "../utils/emailService.js";

export const sendEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const response = await sendEmailService(email);
      return res.json(response);
    }
    return res.json({
      success: false,
      message: "Email is required",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
