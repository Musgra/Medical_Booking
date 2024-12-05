import express from "express";
import {
  addDoctor,
  adminDashboard,
  adminLogin,
  allDoctors,
  appointmentsAdmin,
  cancelAppointmentByAdmin,
  allPatients,
  deleteDoctor,
  getDoctorProfile,
  adminUpdateDoctorProfile,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", adminLogin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointmentByAdmin);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/patients-list", authAdmin, allPatients);
adminRouter.get("/doctor-list/:id", authAdmin, getDoctorProfile);
adminRouter.put("/doctor-list/:id", authAdmin, adminUpdateDoctorProfile);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);
export default adminRouter;
