import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import "../index.css";
import FeedbackForm from "./FeedbackForm";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const socket = io("http://localhost:4000");

Modal.setAppElement("#root");

const MyAppointments = () => {
  const {
    backendUrl,
    token,
    getDoctorsData,
    addReview,
    userData,
    slotDateFormat,
  } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [viewFormModalIsOpen, setViewFormModalIsOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const uniqueDoctors = [
    ...new Set(appointments.map((appointment) => appointment.docData.name)),
  ];

  const getUserAppointment = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: {
          token,
        },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  //
  const openModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleCancel = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointment();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
    closeModal();
  };

  useEffect(() => {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;
    socket.emit("joinUserRoom", userId);

    const handleNewAppointment = (data) => {
      if (data.userId === userId) {
        console.log("New appointment received:", data);
        getUserAppointment();
      }
    };

    const handleAppointmentStatusUpdate = (data) => {
      console.log("Appointment status updated:", data);
      if (data.userId === userId) {
        if (data.status === "cancelled" && data.cancelledBy === "doctor") {
          alert(
            `Appointment ${data.appointmentId} was cancelled by the doctor.`
          );
        } else if (data.status === "confirmed") {
          alert(
            `Appointment ${data.appointmentId} was accepted by the doctor.`
          );
        } else if (data.status === "completed") {
          alert(
            `Appointment ${data.appointmentId} was completed. You can give feedback to the doctor.`
          );
        }
        getUserAppointment();
      }
    };

    socket.on("newAppointment", handleNewAppointment);
    socket.on("appointmentStatusUpdate", handleAppointmentStatusUpdate);

    return () => {
      socket.off("newAppointment", handleNewAppointment);
      socket.off("appointmentStatusUpdate", handleAppointmentStatusUpdate);
    };
  }, [token, socket]);

  const openFeedbackModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFeedbackModalIsOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalIsOpen(false);
    setSelectedAppointment(null);
  };

  // Update appointment status to isReviewed: true
  const updateAppointmentStatus = (appointmentId) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === appointmentId
          ? { ...appointment, isReviewed: true }
          : appointment
      )
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? moment(date).format("YYYY-MM-DD") : "");
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = moment(appointment.slotDate, "DD_MM_YYYY").format(
      "YYYY-MM-DD"
    );
    const matchesDate = selectedDate ? appointmentDate === selectedDate : true;
    const matchesDoctor = selectedDoctor
      ? appointment.docData.name === selectedDoctor
      : true;
    return matchesDate && matchesDoctor;
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      getUserAppointment();
    }
  }, [token]);

  useEffect(() => {
    getDoctorsData();
  }, [appointments]);

  const openViewFormModal = (appointment) => {
    setAppointmentDetails(appointment);
    setViewFormModalIsOpen(true);
  };

  const closeViewFormModal = () => {
    setViewFormModalIsOpen(false);
    setAppointmentDetails(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b">
        <p className="font-medium text-zinc-700 mb-2 md:mb-0">
          My Appointments
        </p>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* Filter by Date */}
          <div className="flex items-center">
            <label htmlFor="filter-date" className="text-sm font-medium mr-2">
              Filter by Date:
            </label>
            <DatePicker
              selected={
                selectedDate
                  ? moment(selectedDate, "YYYY-MM-DD").toDate()
                  : null
              }
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="border rounded p-2 text-sm"
              isClearable
            />
          </div>

          {/* Select Doctor */}
          <div className="flex items-center">
            <label htmlFor="select-doctor" className="text-sm font-medium mr-2">
              Select Doctor:
            </label>
            <select
              id="select-doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="">All Doctors</option>
              {uniqueDoctors.map((doctor, index) => (
                <option key={index} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p className="text-center text-zinc-600 font-semibold text-lg mt-6">
            Loading appointments...
          </p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-center text-zinc-600 font-semibold text-lg mt-6">
            No appointments found
          </p>
        ) : (
          filteredAppointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-blue-200"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.docData.name}
                </p>
                <p>{item.docData.specialty}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.docData.address.line1}</p>
                <p className="text-xs">{item.docData.address.line2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}{" "}
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {item.isPending && !item.cancelled && !item.isCompleted && (
                  <button className="text-sm text-red-500 text-center sm:min-w-48 py-2 border border-red-500 rounded  transition-all duration-300">
                    Pending
                  </button>
                )}
                {!item.isPending && !item.cancelled && !item.isCompleted && (
                  <button className="text-sm text-center sm:min-w-48 py-2 border border-green-500 rounded text-green-500 transition-all duration-300">
                    Approved
                  </button>
                )}

                {!item.cancelled && !item.isCompleted && (
                  <button
                    className=" text-sm text-stone-500 text-center sm:min-w-48 py-2 border
                hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay Online
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => openModal(item._id)}
                    className=" text-sm text-stone-500 text-center sm:min-w-48 py-2 border
                hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 mb-10">
                    {item.cancelledBy === "user" && item.userId === userData._id
                      ? "Cancelled by you"
                      : "Cancelled by doctor"}
                  </button>
                )}

                {item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 mb-10">
                    Completed
                  </button>
                )}

                <button
                  onClick={() => openViewFormModal(item)}
                  className="text-sm text-gray-600 text-center sm:min-w-48 py-2 border border-gray-600 rounded transition-all duration-300 hover:bg-gray-600 hover:text-white"
                >
                  View Information
                </button>
                {item.isCompleted && !item.isReviewed && (
                  <button
                    onClick={() => openFeedbackModal(item)}
                    className="text-sm text-blue-600 text-center sm:min-w-48 py-2 border border-blue-600 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:text-white flex items-center justify-center"
                  >
                    📝 Give Feedback
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Cancel"
        className="modal"
        overlayClassName="overlay"
      >
        <p>Are you sure to cancel this appointment?</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={handleCancel}>
            Yes
          </button>
          <button className="btn-cancel" onClick={closeModal}>
            No
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={feedbackModalIsOpen}
        onRequestClose={closeFeedbackModal}
        contentLabel="Give Feedback"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedAppointment && (
          <FeedbackForm
            userId={userData._id}
            addReview={addReview}
            docId={selectedAppointment.docData._id}
            appointmentId={selectedAppointment._id}
            closeModal={closeFeedbackModal}
            updateAppointmentStatus={updateAppointmentStatus}
            slotDate={selectedAppointment.slotDate}
          />
        )}
      </Modal>

      <Modal
        isOpen={viewFormModalIsOpen}
        onRequestClose={closeViewFormModal}
        contentLabel="View Appointment Form"
        className="modal"
        overlayClassName="overlay"
      >
        {appointmentDetails && (
          <div>
            <h2 className="modal-title">Appointment Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name:</label>
                <p className="form-control">
                  {appointmentDetails.patient.name}
                </p>
              </div>
              <div className="form-group">
                <label>Patient Phone:</label>
                <p className="form-control">
                  {appointmentDetails.patient.phone}
                </p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender:</label>
                <p className="form-control">
                  {appointmentDetails.patient.gender}
                </p>
              </div>
              <div className="form-group">
                <label>Address:</label>
                <p className="form-control">
                  {appointmentDetails.patient.address}
                </p>
              </div>
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <p className="form-control">{appointmentDetails.patient.dob}</p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Reason:</label>
                <p className="form-control">
                  {appointmentDetails.patient.reason}
                </p>
              </div>
            </div>
            <div className="modal-footer flex justify-end gap-4">
              <button onClick={closeViewFormModal} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
