import express from "express";
import {
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
  resetPassword,
  showResetPasswordForm,
  checkTokenValidity,
} from "../controllers/userController.js";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import reviewRouter from "./reviewRoute.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//whenever call api, we provide token in header and be able to get user profile
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateUserProfile
);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/google-login", googleLogin);
userRouter.post("/change-password", authUser, changePassword);
userRouter.get("/forgot-password", requestPasswordReset);
userRouter.get("/reset-password/:token", showResetPasswordForm);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.get("/check-token/:token", checkTokenValidity);
userRouter.get("/notifications", authUser, getNotifications);
userRouter.post("/mark-all-as-read", authUser, markAllAsRead);
userRouter.put(
  "/notifications/:notificationId/markAsRead",
  authUser,
  markAsRead
);

export default userRouter;
