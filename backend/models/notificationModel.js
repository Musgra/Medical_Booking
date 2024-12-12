import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Types.ObjectId, required: true },
  appointmentId: {
    type: mongoose.Types.ObjectId,
    ref: "appointment",
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "appointment_request",
      "appointment_accepted",
      "appointment_cancelled_by_user",
      "appointment_cancelled_by_doctor",
      "appointment_completed",
      "payment_request",
      "payment_success",
    ],
    required: true,
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;
