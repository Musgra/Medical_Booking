import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import cloudinary from "cloudinary";
import { sendEmailService } from "../utils/emailService.js";
import { io } from "../server.js";
import { sendAppointmentConfirmationEmail } from "../utils/emailService.js";
import userModel from "../models/userModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select(["-password", "-email"])
      .populate({
        path: "reviews",
        populate: { path: "userId" },
      })
      .populate({
        path: "reviews",
        populate: { path: "appointmentId" },
      });

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor login

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    // Check if password is null or undefined
    if (!doctor.password) {
      return res.status(400).json({ message: "Password is missing" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor model
const doctorAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    return res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const appointmentAccept = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    const { userId } = appointmentData;
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isPending: false,
      });
    }

    const userData = await userModel.findById(userId).select("-password");
    const appointmentDetails = `
        Doctor: ${appointmentData.docData.name}
        Time: ${appointmentData.slotTime}
        Date: ${appointmentData.slotDate}
    Status: Approved - Doctor is approved your booking. Please check for more information.
  `;
    await sendAppointmentConfirmationEmail(userData.email, appointmentDetails);

    io.to(userId).emit("appointmentStatusUpdate", {
      appointmentId,
      docId,
      userId,
      message: "Appointment has been accepted.",
      status: "confirmed",
    });

    return res.json({ success: true, message: "Appointment accepted" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    //same doctor
    const { userId } = appointmentData;
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      io.to(userId).emit("appointmentStatusUpdate", {
        appointmentId,
        docId,
        userId,
        message: "Appointment has been completed.",
        status: "completed",
      });
      return res.json({ success: true, message: "Appointment completed" });
    } else {
      return res.json({ success: false, message: "Invalid appointment" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    // Check if the appointment belongs to the doctor
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
        cancelledBy: "doctor",
      });

      // Release the slot
      const { slotDate, slotTime, userId } = appointmentData;
      const doctorData = await doctorModel.findById(docId);
      let slots_booked = doctorData.slots_booked;

      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      io.to(userId).emit("appointmentStatusUpdate", {
        appointmentId,
        docId,
        userId,
        message: "Appointment has been cancelled.",
        status: "cancelled",
        cancelledBy: "doctor",
      });

      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancelled failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    const completedAppointments = await appointmentModel.find({
      docId,
      isCompleted: true,
    });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashboardData = {
      earnings,
      completedAppointments: completedAppointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    return res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    return res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile for doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
    });
    return res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to send remedy
const sendRemedyToPatient = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Please upload remedy image",
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    console.log(appointmentData);
    console.log(docId);
    if (!appointmentData || appointmentData.docId !== docId) {
      return res.json({ success: false, message: "Invalid appointment" });
    }

    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // Update appointment with remedy image and status
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      sendRemedy: true,
      remedyImage: imageUpload.secure_url,
    });

    // Send email to patient with remedy image
    await sendEmailService(
      appointmentData.userData.email,
      `Your doctor has sent you a remedy. You can view it here: ${imageUpload.secure_url}`
    );

    return res.json({
      success: true,
      message: "Remedy sent successfully",
      remedyImage: imageUpload.secure_url,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get remedy details
const viewRemedy = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      remedyImage: appointmentData.remedyImage,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to change doctor password
const changeDoctorPassword = async (req, res) => {
  try {
    const { docId, currentPassword, newPassword } = req.body;

    // Tìm bác sĩ theo ID
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Mã hóa mật khẩu mới và lưu lại
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    doctor.password = hashedPassword;
    await doctor.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getPatientList = async (req, res) => {
  try {
    const { docId } = req.body;

    // Lấy tất cả các cuộc hẹn của bác sĩ
    const appointments = await appointmentModel.find({ docId });

    // Khởi tạo thống kê cho bệnh nhân
    const patientStats = {};
    appointments.forEach(({ userId, isCompleted, cancelled }) => {
      if (!patientStats[userId]) {
        patientStats[userId] = { completed: 0, cancelled: 0 };
      }
      if (isCompleted) patientStats[userId].completed += 1;
      if (cancelled) patientStats[userId].cancelled += 1;
    });

    // Lấy danh sách userId từ các cuộc hẹn
    const userIds = Object.keys(patientStats);

    // Lấy thông tin bệnh nhân từ userModel
    const users = await userModel
      .find({ _id: { $in: userIds } })
      .select("-password");

    // Kết hợp dữ liệu bệnh nhân với thống kê
    const patients = users.map((user) => ({
      ...user.toObject(),
      completed: patientStats[user._id]?.completed || 0,
      cancelled: patientStats[user._id]?.cancelled || 0,
    }));

    res.json({ success: true, patients });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getPatientDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { docId } = req.body;

    const user = await userModel.findById(userId).select("-password");
    const appointments = await appointmentModel.find({ userId, docId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  doctorLogin,
  doctorAppointments,
  appointmentAccept,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  sendRemedyToPatient,
  viewRemedy,
  changeDoctorPassword,
  getPatientList,
  getPatientDetails,
};
