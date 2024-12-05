import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import "../../index.css";
import { formatDate } from "../../utils/formatDate";

Modal.setAppElement("#root");

const slotDateFormatForInput = (date) => {
  const [day, month, year] = date.split("_");
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
};

// Function to check if the slotDate matches the selectedDate
const matchSelectedDate = (slotDate, selectedDate) => {
  const formattedSlotDate = slotDateFormatForInput(slotDate); // Convert slotDate
  return selectedDate ? formattedSlotDate === selectedDate : true;
};

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [sortedAppointments, setSortedAppointments] = useState([]);
  const [isAscending, setIsAscending] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  useEffect(() => {
    if (appointments.length > 0) {
      const sorted = [...appointments].sort((a, b) => {
        const dateA = new Date(
          a.slotDate.split("_").reverse().join("-") + " " + a.slotTime
        );
        const dateB = new Date(
          b.slotDate.split("_").reverse().join("-") + " " + b.slotTime
        );
        return isAscending ? dateA - dateB : dateB - dateA;
      });
      setSortedAppointments(sorted);
    }
  }, [appointments, isAscending]);

  const sortAppointments = () => {
    const sorted = [...sortedAppointments].sort((a, b) => {
      const dateA = new Date(
        a.slotDate.split("_").reverse().join("-") + " " + a.slotTime
      );
      const dateB = new Date(
        b.slotDate.split("_").reverse().join("-") + " " + b.slotTime
      );
      return isAscending ? dateA - dateB : dateB - dateA;
    });
    setSortedAppointments(sorted);
    setIsAscending(!isAscending);
  };

  const openModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleCancel = () => {
    if (selectedAppointmentId) {
      cancelAppointment(selectedAppointmentId);
    }
    closeModal();
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? moment(date).format("DD/MM/YYYY") : ""); // Handle null case
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleDoctorNameChange = (event) => {
    setSelectedDoctorName(event.target.value);
  };

  const uniqueDoctors = [
    ...new Set(appointments.map((appointment) => appointment.docData.name)),
  ];

  const filteredAppointments = sortedAppointments.filter((appointment) => {
    const matchesDate = matchSelectedDate(
      appointment.slotDate,
      selectedDate
        ? moment(selectedDate, "DD/MM/YYYY").format("YYYY-MM-DD")
        : ""
    );
    const matchesStatus =
      selectedStatus === ""
        ? true
        : selectedStatus === "Completed"
        ? appointment.isCompleted
        : selectedStatus === "Cancelled"
        ? appointment.cancelled
        : !appointment.isCompleted && !appointment.cancelled;
    const matchesDoctorName = selectedDoctorName
      ? appointment.docData.name
          .toLowerCase()
          .includes(selectedDoctorName.toLowerCase())
      : true;

    return matchesDate && matchesStatus && matchesDoctorName;
  });

  return (
    <div className="w-full m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="filter-date" className="text-sm font-medium">
            Filter by Date:
          </label>
          <DatePicker
            selected={
              selectedDate ? moment(selectedDate, "DD/MM/YYYY").toDate() : null
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
            onChange={handleStatusChange}
            className="border rounded p-2 text-sm"
          >
            <option value="">All</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
          <label htmlFor="filter-doctor" className="text-sm font-medium">
            Filter by Doctor:
          </label>
          <select
            value={selectedDoctorName}
            onChange={handleDoctorNameChange}
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

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>
            Date & Time
            <button onClick={sortAppointments}>
              <span>{isAscending ? "▼" : "▲"}</span>
            </button>
          </p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Status</p>
        </div>

        {filteredAppointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] 
            items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p className="break-word">{item.userData.name}</p>
            </div>
            <p className="max-sm:hidden break-word">
              {item.userData.dob === "Not Selected"
                ? "Not set"
                : calculateAge(item.userData.dob)}
            </p>
            <p>{formatDate(item.slotDate, item.slotTime)}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item.docData.image}
                alt=""
              />
              <p className="break-word">{item.docData.name}</p>
            </div>
            <p>
              {item.amount} {currency}
            </p>
            <div className="flex items-center break-word">
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">
                  Cancelled by {item.cancelledBy === "doctor" ? "Doctor" : "User"}
                </p>
              ) : item.isCompleted ? (
                <p className="text-green-400 text-xs font-medium">Completed</p>
              ) : item.isPending ? (
                <p className="text-yellow-400 text-xs font-medium">Pending</p>
              ) : (
                <p className="text-blue-400 text-xs font-medium">Upcoming</p>
              )}
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default AllAppointments;
