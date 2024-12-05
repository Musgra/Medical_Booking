import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Modal from "react-modal";
import { AppContext } from "../../context/AppContext";

const slotDateFormatForInput = (date) => {
  const [day, month, year] = date.split("_");
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
  const { backendUrl, dToken } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/doctor/patient/${userId}`,
          {
            headers: { dToken },
          }
        );
        if (data.success) {
          setPatient(data.user);
          setAppointments(data.appointments);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    fetchPatientDetails();
  }, [userId, dToken]);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate = matchSelectedDate(appointment.slotDate, selectedDate);
    const matchesStatus =
      selectedStatus === ""
        ? true
        : selectedStatus === "Completed"
        ? appointment.isCompleted
        : selectedStatus === "Cancelled"
        ? appointment.cancelled
        : !appointment.isCompleted && !appointment.cancelled;
    return matchesDate && matchesStatus;
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

  return (
    <div className="m-5 w-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back
      </button>
      {patient ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            {patient.name}'s Details
          </h2>
          <div className="bg-white border rounded p-4">
            <p className="text-sm font-medium">Email: {patient.email}</p>
            <p className="text-sm font-medium">Phone: {patient.phone}</p>
            <p className="text-sm font-medium">
              Address: {patient.address || "Not Set"}
            </p>
            <p className="text-sm font-medium">
              Gender:{" "}
              {patient.gender === "Not Selected" ? "Not Set" : patient.gender}
            </p>

            <p className="text-sm font-medium">
              Date of Birth:{" "}
              {patient.dob === "Not Selected"
                ? "Not Set"
                : formatDate(patient.dob)}
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
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="border rounded p-2 text-sm"
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
          </div>

          <div className="bg-white border rounded text-sm max-h-[60vh] overflow-y-scroll">
            <div className="max-sm:hidden grid grid-cols-[0.5fr_1fr_2fr_1fr_1.5fr] gap-1 py-3 px-6 border-b">
              <p>#</p>
              <p>Payment</p>
              <p>Date & Time</p>
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
                  className="grid grid-cols-[0.5fr_1fr_2fr_1fr_1.5fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100"
                >
                  <p className="max-sm:hidden">{index + 1}</p>
                  <div>
                    <p className="text-xs inline border border-primary px-2 rounded-full">
                      {appointment.payment ? "Online" : "Cash"}
                    </p>
                  </div>
                  <p>
                    {slotDateFormat(appointment.slotDate)},{" "}
                    {appointment.slotTime}
                  </p>
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
                      ? `Cancelled by ${
                          appointment.cancelledBy === "doctor"
                            ? "you"
                            : appointment.cancelledBy
                        }`
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
                    <div className="form-group">
                      <label>Patient Name:</label>
                      <p className="form-control">
                        {selectedAppointment.patient.name}
                      </p>
                    </div>
                    <div className="form-group">
                      <label>Patient Phone:</label>
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
                    <div className="form-group">
                      <label>Address:</label>
                      <p className="form-control">
                        {selectedAppointment.patient.address}
                      </p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth:</label>
                    <p className="form-control">
                      {formatDate(selectedAppointment.patient.dob)}
                    </p>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
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
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PatientDetails;
