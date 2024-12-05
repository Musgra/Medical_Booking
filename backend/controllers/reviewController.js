import reviewModel from "../models/reviewModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

// API to get all reviews
const getAllReviews = async (req, res) => {
  try {
    const { docId } = req.params;
    const reviews = await reviewModel
      .find({ docId })
      .populate("user")
      .populate("doctor")
      .populate("appointment")
      .select("-password");
    console.log("Fetched reviews:", reviews);
    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to create a new review
const createReview = async (req, res) => {
  if (!req.body.docId) {
    req.body.docId = req.params.docId;
  }
  if (!req.body.userId) {
    req.body.userId = req.userId;
  }

  // Check if the user has a completed appointment with the doctor
  const appointment = await appointmentModel.findOne({
    docId: req.body.docId,
    userId: req.body.userId,
    isCompleted: true,
  });

  console.log(appointment, "appointment");
  console.log(appointment.slotDate, "slotDate");

  if (!appointment) {
    return res.status(400).json({
      success: false,
      message: "You can only review after completing an appointment.",
    });
  }

  // Check if the review is within 30 days of the appointment
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Convert slotDate to a Date object using the custom parser
  const appointmentDate = parseCustomDate(appointment.slotDate);
  console.log(appointmentDate, "appointmentDate");

  if (appointmentDate < thirtyDaysAgo) {
    return res.status(400).json({
      success: false,
      message: "You can only review within 30 days of the appointment.",
    });
  }

  // Update the appointment to mark it as reviewed
  await appointmentModel.findByIdAndUpdate(req.body.appointmentId, {
    isReviewed: true,
  });

  const newReview = new reviewModel(req.body);

  try {
    const savedReview = await newReview.save();
    const populatedReview = await reviewModel
      .findById(savedReview._id)
      .populate("userId")
      .populate("appointmentId");
    await doctorModel.findByIdAndUpdate(req.body.docId, {
      $push: { reviews: savedReview._id },
    });

    res.status(200).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review, Try again later",
    });
  }
};

// API to get a specific review
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to edit a review
const editReview = async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const { _id } = req.params;
    const updatedReview = await reviewModel
      .findOneAndUpdate({ _id }, { reviewText, rating }, { new: true })
      .populate("userId");

    if (!updatedReview) {
      return res.json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review updated successfully",
      updatedReview,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a review
const deleteReview = async (req, res) => {
  try {
    const { _id, ownerId, userId } = req.body;
    console.log(_id, "id");
    console.log(userId, "userId");
    console.log(ownerId, "ownerId");

    if (!_id) {
      return res
        .status(400)
        .json({ success: false, message: "Review ID (_id) is required" });
    }
    if (ownerId !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }
    const deletedReview = await reviewModel.findByIdAndDelete(_id);

    if (!deletedReview) {
      return res.json({ success: false, message: "Review not found" });
    }
    // Update the average rating and total rating for the doctor
    await reviewModel.averageRating(deletedReview.docId);

    await doctorModel.findByIdAndUpdate(deletedReview.docId, {
      $pull: { reviews: reviewId },
    });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all reviews for admin
const getAllReviewsForAdmin = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({})
      .populate("userId", "name email image")
      .populate("docId", "name specialty image")
      .populate("appointmentId", "slotDate slotTime");

    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReviewForAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await reviewModel.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Update the average rating and total rating for the doctor
    await reviewModel.averageRating(deletedReview.docId);

    await doctorModel.findByIdAndUpdate(deletedReview.docId, {
      $pull: { reviews: reviewId },
    });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to convert "dd_mm_yyyy" to a Date object
function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split("_").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export {
  getAllReviews,
  createReview,
  getReview,
  editReview,
  deleteReview,
  getAllReviewsForAdmin,
  deleteReviewForAdmin,
};
