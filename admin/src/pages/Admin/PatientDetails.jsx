import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Modal from "react-modal";
import { AppContext } from "../../context/AppContext";

const slotDateFormatForInput = (date) => {
  const [day, month, year] = date.split("/");
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
};

const matchSelectedDate = (slotDate, selectedDate) => {
  const formattedSlotDate = slotDateFormatForInput(slotDate);
  return selectedDate ? formattedSlotDate === selectedDate : true;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const PatientDetails = () => {
  const {
    backendUrl,
    aToken,
    getPatientDetails,
    patientDetails,
    setPatientDetails,
    getAllAppointments,
    appointmentsDetails,
    setAppointmentsDetails,
    handleBlockUser,
  } = useContext(AdminContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "block" hoặc "unblock"
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    getPatientDetails(id);
  }, [id]);

  const filteredAppointments = appointmentsDetails.filter((appointment) => {
    const matchesDate = matchSelectedDate(appointment.slotDate, selectedDate);
    const matchesStatus =
      selectedStatus === ""
        ? true
        : selectedStatus === "Completed"
        ? appointment.isCompleted
        : selectedStatus === "Cancelled"
        ? appointment.cancelled
        : !appointment.isCompleted && !appointment.cancelled;
    const matchesDoctor =
      selectedDoctor === "" ||
      appointment.docData.name
        .toLowerCase()
        .includes(selectedDoctor.toLowerCase()); // Lọc theo tên bác sĩ
    return matchesDate && matchesStatus && matchesDoctor;
  });

  const handleDateChange = (date) => {
    setSelectedDate(date ? moment(date).format("YYYY-MM-DD") : "");
  };

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedAppointment(null);
  };

  const handleBlockClick = (action) => {
    setActionType(action);
    setConfirmationModalIsOpen(true);
  };

  const handleDoctorNameChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const uniqueDoctors = [
    ...new Set(
      appointmentsDetails.map((appointment) => appointment.docData.name)
    ),
  ];

  return (
    <div className="m-5 w-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back
      </button>
      {patientDetails ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-2xl font-semibold text-center sm:text-left">
              {patientDetails.name}'s Details
            </h2>
            <button
              className={`mr-4 w-full sm:w-auto py-2 px-4 rounded hover:opacity-90 transition ${
                patientDetails.isBlocked
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              onClick={() =>
                handleBlockClick(patientDetails.isBlocked ? "unblock" : "block")
              }
            >
              {patientDetails.isBlocked ? "Unblock User" : "Block User"}
            </button>
          </div>

          <div className="bg-white border rounded p-4">
            <p className="text-sm font-medium">Email: {patientDetails.email}</p>
            <p className="text-sm font-medium">Phone: {patientDetails.phone}</p>
            <p className="text-sm font-medium">
              Address: {patientDetails.address || "Not Set"}
            </p>
          </div>

          <h3 className="text-xl font-medium mt-6 mb-4">Appointments</h3>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label htmlFor="filter-date" className="text-sm font-medium">
              Filter by Date:
            </label>
            <DatePicker
              selected={
                selectedDate
                  ? moment(selectedDate, "YYYY-MM-DD").toDate()
                  : null
              }
              onChange={(date) =>
                setSelectedDate(date ? moment(date).format("YYYY-MM-DD") : "")
              }
              dateFormat="dd/MM/yyyy"
              className="border rounded p-2 text-sm"
              showMonthDropdown
              showYearDropdown
              maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              isClearable
            />
            <label htmlFor="filter-status" className="text-sm font-medium">
              Filter by Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
            <label htmlFor="filter-doctor" className="text-sm font-medium">
              Filter by Doctor:
            </label>
            <select
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

          <div className="bg-white border rounded text-sm max-h-[60vh] overflow-y-scroll">
            <div className="max-sm:hidden grid grid-cols-[0.5fr_1fr_2fr_2fr_1fr_1.5fr] gap-1 py-3 px-6 border-b">
              <p>#</p>
              <p>Payment</p>
              <p>Date & Time</p>
              <p>Doctor</p>
              <p>Status</p>
              <p>Patient Details</p>
            </div>
            {filteredAppointments.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                There are no schedules on this day
              </p>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[0.5fr_1fr_2fr_2fr_1fr_1.5fr] sm:grid-cols-[0.5fr_1fr_2fr_2fr_1fr_1.5fr] gap-1 items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-100"
                >
                  <p className="hidden sm:block">{index + 1}</p>
                  <div>
                    <p className="text-xs inline border border-primary px-2 rounded-full">
                      {appointment.payment ? "Online" : "Cash"}
                    </p>
                  </div>
                  <p>
                    {appointment.slotDate},{" "}
                    {moment(appointment.slotTime, ["hh:mm A"]).format("HH:mm")}
                  </p>
                  <div className="flex items-center gap-2 max-sm:flex-col max-sm:items-start">
                    <img
                      src={appointment.docData.image}
                      className="w-8 rounded-full bg-gray-200"
                      alt=""
                    />
                    <p className="text-sm">{appointment.docData.name}</p>
                  </div>

                  <p
                    className={`text-xs font-medium ${
                      appointment.isCompleted
                        ? "text-blue-500"
                        : appointment.cancelled
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {appointment.isCompleted
                      ? "Completed"
                      : appointment.cancelled
                      ? `Cancelled by ${appointment.cancelledBy}`
                      : "Pending"}
                  </p>

                  <button
                    className="bg-blue-500 text-white py-1 px-2 rounded-full text-xs hover:bg-blue-600 transition duration-200 max-w-[100px]"
                    onClick={() => openModal(appointment)}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Appointment Details"
            className="modal"
            overlayClassName="overlay"
          >
            {selectedAppointment && (
              <div>
                <h2 className="modal-title">Appointment Details</h2>
                <div className="patient-modal-information">
                  <div className="form-row">
                    <div className="form-group break-word">
                      <label>Patient Name:</label>
                      <p className="form-control">
                        {selectedAppointment.patient.name}
                      </p>
                    </div>
                    <div className="form-group break-word">
                      <label>Patient Phone:</label>
                      <p className="form-control">
                        {selectedAppointment.patient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group break-word">
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
                  <div className="form-group break-word">
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
                    </div>
                  </div>

                  <div className="modal-footer flex justify-end gap-4">
                    <button onClick={closeModal} className="btn-cancel">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
          <Modal
            isOpen={confirmationModalIsOpen}
            onRequestClose={() => setConfirmationModalIsOpen(false)}
            contentLabel="Confirmation"
            className="modal"
            overlayClassName="overlay"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                {actionType === "block" ? "Block User" : "Unblock User"}
              </h2>
              <p>
                {actionType === "block"
                  ? "Are you sure you want to block this user? They won't be able to use the system."
                  : "Are you sure you want to unblock this user? They will regain access to the system."}
              </p>
              <div className="flex justify-end mt-4 gap-4">
                <button
                  onClick={() => setConfirmationModalIsOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleBlockUser(patientDetails._id, actionType === "block");
                    setConfirmationModalIsOpen(false);
                  }}
                  className={`${
                    actionType === "block" ? "bg-red-500" : "bg-green-500"
                  } text-white py-2 px-4 rounded hover:opacity-90`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PatientDetails;
