import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Modal from "react-modal";
import "../../index.css";
import { io } from "socket.io-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const socket = io("http://localhost:4000");

Modal.setAppElement("#root");

// Function to convert slotDate from DD_MM_YYYY to YYYY-MM-DD
const slotDateFormatForInput = (date) => {
  const [day, month, year] = date.split("/");
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
};

// Function to check if the slotDate matches the selectedDate
const matchSelectedDate = (slotDate, selectedDate) => {
  const formattedSlotDate = slotDateFormatForInput(slotDate); // Convert slotDate
  return selectedDate ? formattedSlotDate === selectedDate : true;
};

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    acceptAppointment,
    sendRemedyToPatient,
    viewRemedy,
  } = useContext(DoctorContext);
  const { calculateAge, currency } = useContext(AppContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [actionType, setActionType] = useState("");
  const [currentTab, setCurrentTab] = useState("needConfirmation");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  useEffect(() => {
    const decodedToken = jwtDecode(dToken);
    const docId = decodedToken.id;
    socket.emit("joinDoctorRoom", docId);

    socket.on("newNotification", () => {
      getAppointments();
      console.log("abc");
    });

    return () => {
      socket.off("newNotification");
    };
  }, [dToken]);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate = matchSelectedDate(appointment.slotDate, selectedDate);

    switch (currentTab) {
      case "needConfirmation":
        return (
          appointment.isPending === true &&
          !appointment.cancelled &&
          matchesDate
        );
      case "confirmed":
        return (
          appointment.isPending === false &&
          !appointment.cancelled &&
          appointment.isCompleted === false &&
          matchesDate
        );
      case "cancelled":
        return appointment.cancelled && matchesDate;
      case "completed":
        return (
          appointment.isCompleted === true &&
          !appointment.cancelled &&
          matchesDate
        );
      default:
        return matchesDate;
    }
  });

  const openModal = (appointment, type) => {
    setSelectedAppointment(appointment);
    setActionType(type);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedAppointment(null);
    setActionType("");
  };

  const handleConfirm = () => {
    if (actionType === "cancel") {
      cancelAppointment(selectedAppointment._id);
    } else if (actionType === "accept") {
      acceptAppointment(selectedAppointment._id);
    } else if (actionType === "complete") {
      completeAppointment(selectedAppointment._id);
    }
    closeModal();
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? moment(date).format("YYYY-MM-DD") : ""); // Handle null case
  };

  return (
    <div className="w-full m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="filter-date" className="text-sm font-medium">
          Filter by Date:
        </label>
        <DatePicker
          selected={
            selectedDate ? moment(selectedDate, "YYYY-MM-DD").toDate() : null
          }
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          className="border rounded p-2 text-sm"
          showMonthDropdown
          showYearDropdown
          yearDropdownItemNumber={120}
          scrollableYearDropdown
          isClearable
          maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        />
      </div>

      <div className="tabs flex flex-wrap gap-2 sm:gap-3">
        <button
          className={`py-1 px-2 sm:py-2 sm:px-4 rounded-t ${
            currentTab === "needConfirmation"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } transition duration-300 text-xs sm:text-sm`}
          onClick={() => setCurrentTab("needConfirmation")}
        >
          Need Confirmation
        </button>
        <button
          className={`py-1 px-2 sm:py-2 sm:px-4 rounded-t ${
            currentTab === "confirmed"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } transition duration-300 text-xs sm:text-sm`}
          onClick={() => setCurrentTab("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`py-1 px-2 sm:py-2 sm:px-4 rounded-t ${
            currentTab === "cancelled"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } transition duration-300 text-xs sm:text-sm`}
          onClick={() => setCurrentTab("cancelled")}
        >
          Cancelled
        </button>
        <button
          className={`py-1 px-2 sm:py-2 sm:px-4 rounded-t ${
            currentTab === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } transition duration-300 text-xs sm:text-sm`}
          onClick={() => setCurrentTab("completed")}
        >
          Completed
        </button>
      </div>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1.5fr_3fr_2.5fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Booking Account</p>
          <p>Payment</p>
          <p>Phone</p>
          <p>Date & Time</p>
          <p>Patient Details</p>
          <p>Action</p>
        </div>

        {filteredAppointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-4 max-sm:text-base sm:grid 
            grid-cols-[0.5fr_2fr_1fr_1.5fr_3fr_2.5fr_1fr] gap-1 items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-100"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <div>
                <p className="break-word">{item.userData.name}</p>
                {item.userData.isBlocked && (
                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-md inline-block mt-1">
                    Blocked
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "Cash"}
              </p>
            </div>
            <p className="max-sm:hidden">{item.userData.phone}</p>
            <p className="max-sm:hidden">
              {item.slotDate},{" "}
              {moment(item.slotTime, ["hh:mm A"]).format("HH:mm")}
            </p>
            <p>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-full text-xs sm:text-sm transition duration-300"
                onClick={() => openModal(item, "viewDetails")}
              >
                View Details
              </button>
              {item.isCompleted && !item.sendRemedy ? (
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded-full text-xs sm:text-sm transition duration-300 mt-2"
                  onClick={() => openModal(item, "sendRemedy")}
                >
                  Send Remedy
                </button>
              ) : item.sendRemedy ? (
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-full text-xs sm:text-sm transition duration-300 mt-2"
                  onClick={() => openModal(item, "viewRemedy")}
                >
                  Remedy Sent
                </button>
              ) : null}
            </p>
            {item.cancelled ? (
              <p className="text-xs text-red-500 font-medium">
                {item.cancelledBy === "doctor"
                  ? "Cancelled by you"
                  : "Cancelled by user"}
              </p>
            ) : item.isCompleted ? (
              <p className="text-xs text-blue-500 font-medium">Completed</p>
            ) : !item.isPending && !item.isCompleted ? (
              <div className="flex">
                <img
                  onClick={() => openModal(item, "complete")}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
                <img
                  onClick={() => openModal(item, "cancel")}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
              </div>
            ) : (
              <div className="flex">
                <img
                  onClick={() => openModal(item, "accept")}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
                <img
                  onClick={() => openModal(item, "cancel")}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Appointment Action"
        className="modal"
        overlayClassName="overlay"
      >
        {actionType === "viewDetails" && selectedAppointment ? (
          <div>
            <h2 className="modal-title">Patient Details</h2>
            <form className="patient-modal-information">
              <div className="form-row">
                <div className="form-group break-word">
                  <label>Patient Name:</label>
                  <p className="form-control">
                    {selectedAppointment.patient.name}
                  </p>
                </div>
                <div className="form-group">
                  <label>Patient Phone</label>
                  <p className="form-control">
                    {selectedAppointment.patient.phone}
                  </p>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender:</label>
                  <p className="form-control">
                    {selectedAppointment.patient.gender}
                  </p>
                </div>
                <div className="form-group break-word">
                  <label>Address:</label>
                  <p className="form-control">
                    {selectedAppointment.patient.address}
                  </p>
                </div>
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <p className="form-control">
                  {selectedAppointment.patient.dob}
                </p>
              </div>
              <div className="form-row">
                <div className="form-group break-word">
                  <label>Reason:</label>
                  <p className="form-control">
                    {selectedAppointment.patient.reason}
                  </p>
                </div>{" "}
              </div>

              <div className="modal-footer flex justify-end gap-4">
                <button onClick={closeModal} className="btn-cancel">
                  Close
                </button>
              </div>
            </form>
          </div>
        ) : actionType === "sendRemedy" ? (
          <div>
            <h2 className="modal-title">Send Remedy</h2>
            <p className="text-sm text-gray-500 break-word">
              Send to: {selectedAppointment.userData.email}
            </p>
            <div className="remedy-form">
              <input
                type="file"
                accept="image/*"
                className="form-control mb-4"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
              />
              <div className="modal-buttons mt-4">
                <button
                  onClick={() => {
                    if (selectedFile) {
                      sendRemedyToPatient(
                        selectedAppointment._id,
                        selectedFile
                      );
                      closeModal();
                    } else {
                      toast.error("Please select an image file");
                    }
                  }}
                  className="btn-confirm-booking"
                >
                  Send
                </button>
                <button onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : actionType === "viewRemedy" ? (
          <div>
            <h2 className="modal-title">View Remedy</h2>
            <p className="text-sm text-gray-500 break-word">
              Sent to: {selectedAppointment.userData.email}
            </p>
            <img
              src={selectedAppointment.remedyImage}
              alt="Remedy"
              className="w-full rounded-lg"
            />
            <div className="modal-buttons mt-4">
              <button onClick={closeModal} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>
              Are you sure you want to{" "}
              {actionType === "cancel"
                ? "cancel"
                : actionType === "accept"
                ? "accept"
                : "complete"}{" "}
              this appointment?
            </p>
            <div className="modal-buttons">
              <button onClick={handleConfirm} className="btn-confirm">
                Yes
              </button>
              <button onClick={closeModal} className="btn-cancel">
                No
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
