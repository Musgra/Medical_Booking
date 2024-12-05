import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "user", required: true },
  docId: { type: mongoose.Types.ObjectId, ref: "doctor", required: true },
  appointmentId: {
    type: mongoose.Types.ObjectId,
    ref: "appointment",
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;
