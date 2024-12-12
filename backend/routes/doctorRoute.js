import express from "express";
import {
  doctorList,
  doctorLogin,
  doctorAppointments,
  appointmentCancel,
  appointmentComplete,
  appointmentAccept,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  sendRemedyToPatient,
  viewRemedy,
  changeDoctorPassword,
  getPatientList,
  getPatientDetails,
  
} from "../controllers/doctorController.js";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";
import upload from "../middlewares/multer.js";
import authDoctor from "../middlewares/authDoctor.js";
import reviewRouter from "./reviewRoute.js";

const doctorRouter = express.Router();

doctorRouter.use("/:docId/reviews", reviewRouter);

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.get("/appointments", authDoctor, doctorAppointments);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/accept-appointment", authDoctor, appointmentAccept);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.put(
  "/update-profile",
  authDoctor,
  upload.single("image"),
  updateDoctorProfile
);
doctorRouter.post(
  "/send-remedy",
  authDoctor,
  upload.single("image"),
  sendRemedyToPatient
);
doctorRouter.get("/view-remedy", authDoctor, viewRemedy);
doctorRouter.post("/change-password", authDoctor, changeDoctorPassword);
doctorRouter.get("/patients", authDoctor, getPatientList);
doctorRouter.get("/patient/:userId", authDoctor, getPatientDetails);
doctorRouter.get("/notifications", authDoctor, getNotifications);
doctorRouter.put("/notifications/:notificationId/markAsRead", authDoctor, markAsRead);
doctorRouter.post("/mark-all-as-read", authDoctor, markAllAsRead);

export default doctorRouter;
