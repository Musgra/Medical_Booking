import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import reviewModel from "../models/reviewModel.js";
import mongoose from "mongoose";
import sharp from "sharp";
import fs from "fs/promises";
import streamifier from "streamifier";
import path from "path";

//API for adding a doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialty,
      degree,
      experience,
      about,
      fees,
      address,
      phone,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !specialty ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !phone
    ) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    // validating password length
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl;
    if (imageFile) {
      // Thay đổi kích thước ảnh và chuyển đổi thành buffer
      const filePath = path.resolve(imageFile.path); // Xác định đường dẫn file
      const imageBuffer = await fs.readFile(filePath);

      // Resize ảnh với sharp
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(342, 342) // Resize ảnh về kích thước 342x342
        .toBuffer();

      // Upload ảnh lên Cloudinary qua stream
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(resizedImageBuffer); // Đưa buffer vào stream
      });

      // Xóa file ảnh sau khi xử lý xong
      await fs.unlink(filePath);
    }

    const doctorData = {
      name,
      email,
      image: imageUrl, // Gán URL ảnh từ Cloudinary
      password: hashedPassword,
      specialty,
      degree,
      experience,
      about,
      fees,
      address,
      phone,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({ success: true, token, message: "Admin login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});

    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const { isBlocked } = req.body;
    const user = await userModel.findById(userId);
    if (!userId) {
      return res.json({ success: false, message: "User is not found" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    await appointmentModel.updateMany(
      { userId },
      { $set: { "userData.isBlocked": isBlocked } }
    );

    return res.json({
      success: true,
      message: isBlocked ? "User has been blocked" : "User has been unblocked",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).populate("userId");
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for admin
const cancelAppointmentByAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({
      success: true,
      message: "Appointment Cancelled",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get Dashboard Data for admin panel

const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const completedAppointments = await appointmentModel.find({
      isCompleted: true,
    });

    const specialties = await doctorModel.distinct("specialty");

    const dashboardData = {
      doctors: doctors.length,
      patients: users.length,
      completedAppointments: completedAppointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
      numberOfDepartments: specialties.length, // Số lượng phòng ban
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get all users list for admin panel
const allPatients = async (req, res) => {
  try {
    // Lấy danh sách tất cả bệnh nhân (trừ mật khẩu)
    const patients = await userModel.find({}).select("-password");

    // Sử dụng aggregation pipeline để thống kê số lượng cuộc hẹn
    const appointmentsStats = await appointmentModel.aggregate([
      {
        $group: {
          _id: "$userId", // Nhóm theo userId (bệnh nhân)
          totalAppointments: { $sum: 1 }, // Tổng số cuộc hẹn
          completedAppointments: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          }, // Số cuộc hẹn đã hoàn thành
          cancelledAppointments: {
            $sum: { $cond: ["$cancelled", 1, 0] },
          }, // Số cuộc hẹn bị hủy
        },
      },
    ]);

    // Chuyển danh sách thống kê thành object để dễ dàng truy cập
    const statsMap = appointmentsStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    }, {});

    // Kết hợp thông tin bệnh nhân với thống kê
    const patientsWithStats = patients.map((patient) => {
      const stats = statsMap[patient._id.toString()] || {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      };

      return {
        ...patient.toObject(),
        totalAppointments: stats.totalAppointments,
        completedAppointments: stats.completedAppointments,
        cancelledAppointments: stats.cancelledAppointments,
      };
    });

    res.json({ success: true, patients: patientsWithStats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    await doctorModel.findByIdAndDelete(docId);

    // Delete all appointments related to the doctor
    await appointmentModel.deleteMany({ docId });
    await reviewModel.deleteMany({ docId });

    res.json({
      success: true,
      message: "Doctor and related appointments deleted successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for admin panel
const getDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorProfileData = await doctorModel
      .findById(id)
      .select("-password");
    res.json({ success: true, doctorProfileData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const patients = await userModel.findById(id).select("-password");
    const appointments = await appointmentModel.find({ userId: id });

    if (!patients) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, patients, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API for updating doctor profile
const adminUpdateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Doctor ID is missing" });
    }

    const {
      name,
      email,
      password,
      specialty,
      degree,
      experience,
      about,
      fees,
      address,
      phone,
      available,
    } = req.body;

    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }
    const imageFile = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid Doctor ID" });
    }

    let imageUrl;
    if (imageFile) {
      const filePath = path.resolve(imageFile.path); // Xác định đường dẫn file
      const imageBuffer = await fs.readFile(filePath);

      // Resize ảnh với sharp
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(342, 342) // Resize ảnh về kích thước 300x300
        .toBuffer();

      // Upload ảnh lên Cloudinary qua stream
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(resizedImageBuffer); // Đưa buffer vào stream
      });

      // Xóa file ảnh sau khi xử lý xong
      await fs.unlink(filePath);
    }

    const updateData = {
      name,
      email,
      fees,
      address,
      available,
      degree,
      specialty,
      experience,
      about,
      phone,
    };

    if (password) {
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    await appointmentModel.updateMany(
      { docId: id },
      {
        $set: {
          "docData.name": updatedDoctor.name,
          "docData.image": updatedDoctor.image,
          "docData.specialty": updatedDoctor.specialty,
          "docData.degree": updatedDoctor.degree,
          "docData.experience": updatedDoctor.experience,
          "docData.about": updatedDoctor.about,
          "docData.fees": updatedDoctor.fees,
          "docData.address": updatedDoctor.address,
          "docData.available": updatedDoctor.available,
          "docData.phone": updatedDoctor.phone,
        },
      }
    );

    await reviewModel.updateMany(
      { docId: id },
      {
        $set: {
          doctorName: updatedDoctor.name,
          doctorImage: updatedDoctor.image,
        },
      }
    );

    if (!updatedDoctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully ",
      updateData,
      updatedDoctor,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetDoctorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  addDoctor,
  adminLogin,
  allDoctors,
  appointmentsAdmin,
  cancelAppointmentByAdmin,
  adminDashboard,
  allPatients,
  deleteDoctor,
  getDoctorProfile,
  adminUpdateDoctorProfile,
  resetDoctorPassword,
  getPatientProfile,
  blockUser,
};
