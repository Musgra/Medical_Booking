import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "../utils/StarRating";

const FeedbackForm = ({
  addReview,
  appointmentId,
  closeModal,
  docId,
  userId,
  updateAppointmentStatus,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const handleCancel = () => {
    setRating(0);
    setReviewText("");
    closeModal();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(appointmentId);

    try {
      if (!rating || !reviewText) {
        setLoading(false);
        return toast.error("Please fill all the fields");
      }

      if (!docId) {
        setLoading(false);
        return toast.error("Doctor ID is missing");
      }

      const { data } = await axios.post(
        backendUrl + `/api/doctor/${docId}/reviews/add-review`,
        { appointmentId, docId, userId, reviewText, rating },
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        addReview(data.data);
        updateAppointmentStatus(appointmentId);
        setRating(0);
        setReviewText("");
        setLoading(false);
        closeModal();
        navigate(`/appointment/${docId}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmitReview} className="feedback-form">
      <div>
        <h3 className="text-headingColor text-[16px] leading-6 font-semibold mb-4">
          How would you rate the overall experience?*
        </h3>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div className="mt-[30px]">
        <h3 className="text-headingColor text-[16px] leading-6 font-semibold mb-4 mt-0">
          Share your feedback or suggestions*
        </h3>

        <textarea
          className="border border-solid border-[#0066ff34] focus:outline outline-primaryColor w-full px-4
        py-3 rounded-md"
          rows="5"
          placeholder="Write your message"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            resize: "none",
          }}
          maxLength={200}
        ></textarea>
        <div className="text-right text-sm text-gray-500">
          {200 - reviewText.length} / 200 ký tự còn lại
        </div>
      </div>

      <div className="text-right gap-4 flex justify-end">
        <button
          className="button my-6 rounded-full text-blue-600 hover:bg-gray-200"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white text-sm font-light px-8 py-3 rounded-full my-6 hover:bg-blue-600"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
