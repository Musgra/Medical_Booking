import mongoose from "mongoose";
import doctorModel from "./doctorModel.js"; // Tham chiếu đến doctorModel

// Định nghĩa Review Schema
const reviewSchema = new mongoose.Schema(
  {
    docId: {
      type: mongoose.Types.ObjectId,
      ref: "doctor", // Tham chiếu đến Doctor
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user", // Tham chiếu đến User
      required: true,
    },
    appointmentId: {
      type: mongoose.Types.ObjectId,
      ref: "appointment", // Tham chiếu đến Appointment
    },
    reviewText: {
      type: String,
      required: true,
      maxlength: 200,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware để tự động điền thông tin user khi thực hiện truy vấn
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name image", // Lấy thông tin tên và ảnh của user
  });
  next();
});

// Tính toán tổng số đánh giá và trung bình đánh giá cho Doctor
reviewSchema.statics.averageRating = async function (docId) {
  const stats = await this.aggregate([
    { $match: { docId: docId } },
    {
      $group: {
        _id: "$docId",
        nRating: { $sum: 1 }, // Số lượng đánh giá
        avgRating: { $avg: "$rating" }, // Trung bình đánh giá
      },
    },
  ]);

  await doctorModel.findByIdAndUpdate(docId, {
    totalRating: stats.length > 0 ? stats[0].nRating : 0,
    averageRating: stats.length > 0 ? stats[0].avgRating : 0,
  });
};

// Tự động cập nhật trung bình đánh giá sau khi một review mới được lưu
reviewSchema.post("save", function () {
  this.constructor.averageRating(this.docId);
});

reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc) {
    await doc.constructor.averageRating(doc.docId);
  }
);

// Tự động cập nhật trung bình đánh giá sau khi một review được chỉnh sửa
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.averageRating(doc.docId);
  }
});

reviewSchema.set("strictPopulate", false);

const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
