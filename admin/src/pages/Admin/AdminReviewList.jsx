import React, { useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { formatDate } from "../../utils/formatDate";
import Modal from "react-modal";

Modal.setAppElement("#root");

const AdminReviewList = () => {
  const { reviews, getAllReviews, deleteReview } = useContext(AdminContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    getAllReviews();
  }, []);

  const openModal = (reviewId) => {
    setSelectedReviewId(reviewId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedReviewId(null);
    setModalIsOpen(false);
  };

  const handleDelete = () => {
    if (selectedReviewId) {
      deleteReview(selectedReviewId);
    }
    closeModal();
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <h1 className="mb-3 text-lg font-medium">Admin Review List</h1>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_2fr_2fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>User</p>
          <p>Email</p>
          <p>Doctor</p>
          <p>Date & Time</p>
          <p>Review</p>
          <p>Action</p>
        </div>

        {reviews.map((review, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_2fr_2fr_1fr] 
            items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-100"
            key={review._id}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={review.userId.image}
                alt="User"
              />
              <div>
                <p className="break-word">{review.userId.name}</p>
                {review.userId.isBlocked && (
                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-md inline-block mt-1">
                    Blocked
                  </span>
                )}
              </div>
            </div>
            <div className="break-word">
              <p>{review.userId.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={review.docId.image}
                alt="Doctor"
              />
              <p className="break-word">{review.docId.name}</p>
            </div>
            <div>
              <p className="break-word">{formatDate(review.createdAt)}</p>
            </div>
            <div className="wrap break-word">
              <p>{review.reviewText}</p>
              <p>Rating: {review.rating}</p>
            </div>
            <button
              className="delete-button"
              onClick={() => openModal(review._id)} // Mở Modal
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Delete"
        className="modal"
        overlayClassName="overlay"
      >
        <p>Are you sure you want to delete this review?</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={handleDelete}>
            Yes
          </button>
          <button className="btn-cancel" onClick={closeModal}>
            No
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReviewList;
