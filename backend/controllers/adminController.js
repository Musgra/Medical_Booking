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
import fs from "fs";
import streamifier from "streamifier";

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
      !address
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
      const resizedImageBuffer = await sharp(imageFile.path)
        .resize(342, 342) // Thay đổi kích thước ảnh
        .toBuffer();

      // Tải lên Cloudinary từ buffer
      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          streamifier.createReadStream(resizedImageBuffer).pipe(uploadStream);
        });
      };

      imageUrl = await uploadFromBuffer();
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
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log(error);
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
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for admin
const cancelAppointmentByAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    console.log(appointmentId);

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
    console.log(error);
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
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get all users list for admin panel
const allPatients = async (req, res) => {
  try {
    const patients = await userModel.find({}).select("-password");
    // get number of appointments for each patient
    const patientsWithAppointments = await Promise.all(
      patients.map(async (patient) => {
        const appointments = await appointmentModel.find({
          userId: patient._id,
          cancelled: false, // Exclude canceled appointments
        });
        return { ...patient, appointmentCount: appointments.length };
      })
    );
    res.json({ success: true, patients: patientsWithAppointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    // Delete the doctor
    await doctorModel.findByIdAndDelete(docId);

    // Delete all appointments related to the doctor
    await appointmentModel.deleteMany({ docId });

    res.json({
      success: true,
      message: "Doctor and related appointments deleted successfully",
    });
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
      fees,
      address,
      available,
      name,
      degree,
      specialty,
      experience,
      about,
    } = req.body;
    const imageFile = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid Doctor ID" });
    }

    let imageUrl;
    if (imageFile) {
      // Thay đổi kích thước ảnh trước khi upload
      const resizedImageBuffer = await sharp(imageFile.path)
        .resize(300, 300) // Thay đổi kích thước theo chiều rộng và chiều cao
        .toBuffer();

      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(resizedImageBuffer, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const updateData = {
      name,
      fees,
      address: JSON.parse(address),
      available,
      degree,
      specialty,
      experience,
      about,
    };

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
    console.log(error);
    res.json({ success: false, message: error.message });
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
};
