import express from "express";

import {
  createReview,
  editReview,
  deleteReview,
  getAllReviews,
  getReview,
  getAllReviewsForAdmin,
  deleteReviewForAdmin,
} from "../controllers/reviewController.js";
import authAdmin from "../middlewares/authAdmin.js";
import authUser from "../middlewares/authUser.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:reviewId", getReview);
reviewRouter.post("/add-review", authUser, createReview);
reviewRouter.put("/:_id/edit-review", authUser, editReview);
reviewRouter.delete("/:_id/delete-review", authUser, deleteReview);
reviewRouter.get("/admin/all-reviews", authAdmin, getAllReviewsForAdmin);
reviewRouter.delete("/admin/:reviewId/delete-review", authAdmin, deleteReviewForAdmin);

export default reviewRouter;
