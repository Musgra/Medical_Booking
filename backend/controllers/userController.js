import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import sharp from "sharp";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { sendEmailService } from "../utils/emailService.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailService.js";
import { io } from "../server.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const frontendUrl = process.env.VITE_FRONTEND_URL;

// API for user registration
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    // Check if email or username already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email or username already exists",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Generate a random name
    const randomName = Math.random().toString(36).substring(2, 8);

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      username,
      name: randomName,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res.json({
      success: true,
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    return res.json({
      success: true,
      message: "User profile fetched successfully",
      userData,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (name.length < 3 || name.length > 15) {
      return res.json({
        success: false,
        message: "Name must be between 3 and 15 characters long",
      });
    }

    if (phone.length !== 10) {
      return res.json({
        success: false,
        message: "Phone number must be exactly 10 characters long",
      });
    }

    if (address.length > 80) {
      return res.json({
        success: false,
        message: "Address must be 80 characters or less",
      });
    }

    // Update user profile
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address,
      dob,
      gender,
    });

    // Update user information in appointments
    await appointmentModel.updateMany(
      { userId },
      {
        $set: {
          "userData.name": name,
          "userData.phone": phone,
          "userData.address": address,
          "userData.dob": dob,
          "userData.gender": gender,
        },
      }
    );

    let imageUrl;
    if (imageFile) {
      // Resize image before upload
      const resizedImageBuffer = await sharp(imageFile.path)
        .resize(342, 342) // Resize to width and height
        .toFile("temp_image.png"); // Save resized image to a temporary file

      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload("temp_image.png", {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;

      fs.unlinkSync("temp_image.png");
      await userModel.findByIdAndUpdate(userId, {
        image: imageUrl,
      });

      // Update image in appointments
      await appointmentModel.updateMany(
        { userId },
        {
          $set: {
            "userData.image": imageUrl,
          },
        }
      );
    }

    return res.json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    const patient = JSON.parse(req.body.patient);

    // Fetch the doctor's name only
    const doctor = await doctorModel.findById(docId).select("name");
    const doctorName = doctor.name;

    // Define the maximum number of appointments allowed
    const maxAppointments = 5;

    // Count the number of appointments the user has
    const userAppointmentsCount = await appointmentModel.countDocuments({
      userId,
      cancelled: false,
      isCompleted: false,
    });

    // Check if the user has reached the limit
    if (userAppointmentsCount >= maxAppointments) {
      return res.json({
        success: false,
        message: "You have reached the maximum number of appointments allowed.",
      });
    }

    // Check for recent cancellations by the user within the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const userCancellations = await appointmentModel.countDocuments({
      userId,
      cancelled: true,
      cancelledBy: "user",
      date: { $gte: oneDayAgo }, // Check cancellations within the last 24 hours
    });

    if (userCancellations >= 3) {
      return res.json({
        success: false,
        message:
          "You have cancelled too many appointments in the last 24 hours. Please try again later.",
      });
    }

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available at the moment",
      });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      patient,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slot in doctor's slots_booked
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    io.to(docId).emit("newAppointment", {
      docId,
      patientName: userData.name,
      slotDate,
      slotTime,
    });

    // Send email after successful booking
    const appointmentDetails = `
    Doctor: ${doctorName}
    Time: ${slotTime}
    Date: ${slotDate}
    Status: Pending - A new appointment is waiting for confirmation
  `;
    await sendEmailService(userData.email, appointmentDetails);

    return res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for fronted my-appointments page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    console.log(appointmentId);

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized action",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: "user",
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    io.to(docId).emit("appointmentStatusUpdate", {
      appointmentId,
      docId,
      userId,
      message: "Appointment has been cancelled.",
      status: "cancelled",
      cancelledBy: "user",
    });
    console.log(docId);

    res.json({
      success: true,
      message: "Appointment Cancelled",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to make payment online of appointment

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GG_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        newUser: true, // Thêm trạng thái để frontend biết cần hiển thị form tài khoản
        email,
        name,
        googleId: sub,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, newUser: false, token: jwtToken });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const user = await userModel.findOne({ _id: userId }).select("+password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.json({ success: false, message: "User password not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = user.createPasswordChangeToken();
    const resetPasswordUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await user.save();

    // Send email
    const html = `Please click the link below to reset your password. This link will expire in 15 minutes: <a href="${resetPasswordUrl}">Click here</a>`;

    const data = {
      email,
      html,
    };
    const rs = await sendPasswordResetEmail(data);

    res.json({
      success: true,
      rs,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const showResetPasswordForm = async (req, res) => {
  try {
    const { email, token } = req.query;
    if (!email || !token) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await userModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const setupUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: "Username already exists" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.username = username;
    user.password = hashedPassword;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, message: "User setup completed", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const checkTokenValidity = async (req, res) => {
  try {
    const { token } = req.params;
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await userModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    res.json({ success: true, message: "Token is valid" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  googleLogin,
  changePassword,
  requestPasswordReset,
  showResetPasswordForm,
  resetPassword,
  setupUser,
  checkTokenValidity,
};
