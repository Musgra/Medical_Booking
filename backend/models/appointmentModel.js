import mongoose from "mongoose";
import userModel from "./userModel.js";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true }, // ID bác sĩ
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true }, // Lưu trữ thêm thông tin người đặt
  docData: { type: Object, required: true }, // Lưu trữ thêm thông tin bác sĩ
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  cancelled: { type: Boolean, default: false },
  cancelledBy: { type: String, enum: ["user", "doctor"], default: null }, // New field
  payment: { type: Boolean, default: false }, // `true` nếu trả online, `false` nếu tiền mặt
  isPending: {
    type: Boolean,
    default: true,
  },
  isCompleted: { type: Boolean, default: false },
  isReviewed: { type: Boolean, default: false },
  sendRemedy: { type: Boolean, default: false },
  remedyImage: { type: String, default: "" }, // To store the image URL
  patient: {
    name: { type: String, required: true }, // Tên người cần khám
    phone: { type: String, required: true }, // Số điện thoại hoặc email người cần khám
    dob: { type: String, required: true }, // (tuỳ chọn) tuổi người cần khám
    gender: { type: String, required: true }, // (tuỳ chọn) giới tính
    reason: { type: String, required: true }, // Lý do khám
    address: { type: String, required: true }, // Địa chỉ người cần khám
  },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
