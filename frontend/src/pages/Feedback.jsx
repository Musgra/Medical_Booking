import React, { useState, useContext, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import FeedbackForm from "./FeedbackForm";
import { AppContext } from "../context/AppContext";
import { formatDate } from "../utils/formatDate";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import StarRating from "../utils/StarRating";
import Modal from "react-modal"; // Import the Modal component
import "../index.css";
import useEscKey from "../utils/handleEscKey";

Modal.setAppElement("#root"); // Set the app element for accessibility
const Feedback = ({
  reviews,
  totalRating,
  addReview,
  deleteReview,
  setReviews,
  updateDocInfo,
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { docId } = useParams();
  const { backendUrl, token, userData, slotDateFormat } =
    useContext(AppContext);
  const [isEditReview, setIsEditReview] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5; // Number of comments per page

  // Calculate the indices for slicing the reviews array
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = reviews.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const totalPages = Math.ceil(reviews.length / commentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEscKey(() => {
    if (isEditReview) {
      setIsEditReview(false);
      setEditReviewId(null);
      setEditReviewText("");
      setEditReviewRating(0);
    }
  });

  // const handleAddReview = (newReview) => {
  //   addReview(newReview);
  //   setShowFeedbackForm(false);
  // };

  const handleSubmitDelete = async (_id, ownerId) => {
    setLoading(true);
    console.log(_id, "id");
    console.log(ownerId, "ownerId");

    try {
      const { data } = await axios.delete(
        backendUrl + `/api/doctor/${docId}/reviews/${_id}/delete-review`,
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
          data: JSON.stringify({ _id, ownerId }),
        }
      );

      if (data.success) {
        toast.success(data.message);
        deleteReview(_id);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Failed to delete review");
    }
  };

  const handleEditClick = (review) => {
    setIsEditReview(true);
    setEditReviewId(review._id);
    setEditReviewText(review.reviewText);
    setEditReviewRating(review.rating);
  };

  const handleEditSubmit = async (_id) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        backendUrl + `/api/doctor/${docId}/reviews/${_id}/edit-review`,
        { reviewText: editReviewText, rating: editReviewRating },
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        const updatedReviews = reviews.map((review) =>
          review._id === data.updatedReview._id ? data.updatedReview : review
        );
        setReviews(updatedReviews);
        updateDocInfo(updatedReviews);
        setIsEditReview(false);
        setEditReviewId(null);
        setEditReviewText("");
        setEditReviewRating(0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error, "error");
      toast.error("Failed to edit review");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setModalIsOpen(false);
    setReviewToDelete(null);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      handleSubmitDelete(reviewToDelete._id, reviewToDelete.userId._id);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [docId]);

  return (
    <div>
      <div className="mb-[50px]">
        <h4 className="text-[20px] leading-[30px] font-bold text-headingColor mb-[30px]">
          All reviews ({reviews?.length})
        </h4>

        {currentComments.map((review, index) => (
          <div key={index} className="flex flex-col gap-2 mb-[30px]">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <figure className="w-10 h-10 rounded-full">
                  <img
                    className="w-full h-full"
                    src={review?.userId?.image || "default-photo-url"}
                    alt=""
                  />
                </figure>
                <div>
                  <h5 className="text-[16px] leading-6 text-primaryColor font-bold">
                    {review?.userId?.name || "Anonymous"} - Completed on{" "}
                    {slotDateFormat(review?.appointmentId?.slotDate || "")}
                  </h5>
                  <p className="text-[14px] leading-6 text-grayColor">
                    {formatDate(review?.createdAt) || "Unknown date"}
                  </p>
                  {isEditReview && editReviewId === review._id ? (
                    <div>
                      <textarea
                        className="text_para mt-3 font-medium text-[15px] border border-gray-300 rounded-md p-2 w-full lg:w-[500px]"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          resize: "none",
                        }}
                        value={editReviewText}
                        onChange={(e) => setEditReviewText(e.target.value)}
                        rows={4}
                        maxLength={200}
                      />
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">
                          Nhấn Esc để hủy
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {200 - editReviewText.length} / 200 ký tự còn lại
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text_para mt-3 font-medium text-[15px] lg:max-w-[400px] break-word">
                      {review?.reviewText || "No review text"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {isEditReview && editReviewId === review._id ? (
                  <div className="flex gap-1">
                    <StarRating
                      rating={editReviewRating}
                      setRating={setEditReviewRating}
                      color="#0067FF"
                    />
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {[...Array(review?.rating || 0).keys()].map((_, index) => (
                      <AiFillStar key={index} color="#0067FF" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {userData && review?.userId?._id === userData?._id && (
              <div className="flex gap-3 mt-2 justify-end">
                {!isEditReview && (
                  <button
                    className="button button-delete"
                    onClick={() => openDeleteModal(review)}
                  >
                    Delete
                  </button>
                )}
                {isEditReview && editReviewId === review._id ? (
                  <button
                    className="button button-edit"
                    onClick={() => handleEditSubmit(review._id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="button button-edit"
                    onClick={() => handleEditClick(review)}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <button
            className="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* {userData && !showFeedbackForm && (
        <div className="text-center">
          <button
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
            onClick={() => setShowFeedbackForm(true)}
          >
            Give Feedback
          </button>
        </div>
      )} */}
      {/* {showFeedbackForm && (
        <FeedbackForm
          docId={docId}
          addReview={handleAddReview}
          setShowFeedbackForm={setShowFeedbackForm}
        />
      )} */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirm Delete"
        className="modal"
        overlayClassName="overlay"
      >
        <p>Are you sure you want to delete this review?</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={confirmDelete}>
            Yes
          </button>
          <button className="btn-cancel" onClick={closeDeleteModal}>
            No
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Feedback;
