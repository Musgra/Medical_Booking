import React, { useContext, useState, useEffect } from "react";
import RelatedDoctors from "../components/RelatedDoctors";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Feedback from "./Feedback"; // Import the Feedback component
import "../index.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

Modal.setAppElement("#root");

const Appointment = () => {
  const { docId } = useParams();
  const {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    getDoctorsData,
    userData,
  } = useContext(AppContext);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
      setReviews(docInfo.reviews || []);
    }
  }, [docInfo]);

  const fetchDocInfo = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`, {
        headers: { token },
      });

      if (data.success) {
        const doctor = data.doctors.find((doc) => doc._id === docId);
        if (doctor) {
          setDocInfo(doctor);
          setReviews(doctor.reviews);
          getDoctorsData();
          getAvailableSlots();
        } else {
          toast.error("Doctor not found");
        }
      } else {
        toast.error("Failed to fetch doctors list");
      }
    } catch (error) {
      toast.error("Failed to fetch doctor info");
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId]);

  const getAvailableSlots = () => {
    if (!docInfo) return;

    setDocSlots([]);
    const today = new Date();
    let startDay = today.getHours() >= 21 ? 1 : 0;

    const createDateWithTime = (baseDate, hours, minutes = 0) => {
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const isSlotBooked = (date, time) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const bookedSlotDate = `${day}/${month}/${year}`;
      return (
        docInfo.slots_booked[bookedSlotDate] &&
        docInfo.slots_booked[bookedSlotDate].includes(time)
      );
    };

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i + startDay); // > 21h => startDay = 1 (start from next day), else = 0

      let startTime =
        i === 0 && startDay === 0
          ? createDateWithTime(
              currentDate,
              Math.max(today.getHours() + 1, 10),
              today.getMinutes() > 30 ? 30 : 0
            ) //today
          : createDateWithTime(currentDate, 10, 0); // other day

      const endTime = createDateWithTime(currentDate, 21, 0);
      const timeSlots = [];

      while (startTime <= endTime) {
        const formattedTime = startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!isSlotBooked(startTime, formattedTime)) {
          timeSlots.push({
            datetime: new Date(startTime),
            time: formattedTime,
          });
        }
        startTime.setMinutes(startTime.getMinutes() + 30);
      }

      if (i === 0 && timeSlots.length === 0 && startDay === 0) {
        startDay = 1;
        i--;
        continue;
      }

      setDocSlots((prevSlots) => [...prevSlots, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }

    setLoading(true);

    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = `${day}/${month}/${year}`;

      const formData = new FormData();
      formData.append("docId", docId);
      formData.append("slotDate", slotDate);
      formData.append("slotTime", slotTime);

      // Format DOB to dd/mm/yyyy
      const formattedDob = dob.split("-").reverse().join("/");

      const patient = {
        name,
        phone,
        address,
        dob: formattedDob,
        gender,
        reason,
      };

      // Append `patient` to `formData`
      formData.append("patient", JSON.stringify(patient));

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (!slotTime) {
      toast.warn("Please select a time slot before booking an appointment");
      return;
    }
    setModalIsOpen(true);
  };
  const closeModal = () => setModalIsOpen(false);
  const confirmBooking = async (event) => {
    event.preventDefault();

    const form = event.target.closest("form");

    if (phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 characters long");
      toast.warn("Phone number must be exactly 10 characters long");
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity(); // Hiển thị thông báo lỗi cho các trường không hợp lệ
      return;
    }

    closeModal();
    bookAppointment();
  };

  const addReview = (newReview) => {
    setReviews([...reviews, newReview]);
    setDocInfo((prevDocInfo) => ({
      ...prevDocInfo,
      reviews: [...prevDocInfo.reviews, newReview],
      totalRating: prevDocInfo.totalRating + 1, // Assuming totalRating is a count of reviews
      averageRating: calculateNewAverageRating([
        ...prevDocInfo.reviews,
        newReview,
      ]), // Function to calculate new average
    }));
  };

  const calculateNewAverageRating = (reviews) => {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const deleteReview = (_id) => {
    setReviews(reviews.filter((review) => review._id !== _id));
  };

  const updateDocInfo = (updatedReviews) => {
    setDocInfo((prevDocInfo) => ({
      ...prevDocInfo,
      reviews: updatedReviews,
    }));
  };

  return (
    docInfo && (
      <div>
        {/* ----- Doctor Details ----- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo?.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* ----- Doctor Info: name, degree, experience ----- */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo?.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>

            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600 ">
              <p className="">
                {docInfo?.degree} - {docInfo?.specialty}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo?.experience}
              </button>
              <p className="flex items-center gap-1">
                <span
                  className="flex items-center gap-[6px] text-[12px] leading-5 lg:text-[14px] 
                  lg:leading-7 font-semibold"
                >
                  <img
                    className="w-[15px] h-[15px]"
                    src={assets.star_icon}
                    alt=""
                  />
                  {docInfo?.averageRating.toFixed(1)}
                </span>
                <span
                  className="text-[12px] leading-5 lg:text-[14px] lg:leading-7 font-[400]
                  "
                >
                  ({docInfo?.totalRating})
                </span>
              </p>
            </div>

            {/* ----- Doctor About ----- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-700 font-medium max-w-[700px] mt-1">
                {docInfo?.about}
              </p>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                Phone Number
              </p>
              <p className="text-sm text-gray-700 font-medium mt-1">
                {docInfo?.phone}
              </p>
              <div className="address-section mt-4">
                <p className="text-sm font-medium text-gray-900">Address</p>
                <ul className="space-y-2 mt-2">
                  {docInfo?.address && (
                    <li className="flex items-center font-medium text-gray-700 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 11.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 11.25c0 7.5-7.5 9.75-7.5 9.75s-7.5-2.25-7.5-9.75a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      {docInfo?.address}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <p className="font-medium text-sm text-gray-900 mt-3">
              Appointment Fee:{" "}
              <span className="text-gray-900">
                {docInfo?.fees} {currencySymbol}
              </span>
            </p>
          </div>
        </div>

        {/* ----- Booking Slots ----- */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>

          <div className="flex gap-3 items-center w-full overflow-x-scroll custom-scrollbar mt-4 pb-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  }`}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-auto custom-scrollbar mt-4 pb-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white"
                      : "text-gray-400 border border-gray-300"
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={openModal}
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
            disabled={loading}
          >
            {loading ? "Loading..." : "Book Appointment"}
          </button>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Booking Appointment"
            className="modal"
            overlayClassName="overlay"
          >
            <div className="appointment-modal-content">
              <h2 className="modal-title">
                Information to book a medical appointment
              </h2>

              <div className="doctor-info">
                <img
                  src={docInfo?.image}
                  alt="Doctor"
                  className="doctor-image"
                />
                <div className="doctor-details">
                  <p>{docInfo?.name}</p>
                  {docSlots.length > 0 &&
                    docSlots[slotIndex] &&
                    docSlots[slotIndex][0] && (
                      <p>
                        {slotTime} -{" "}
                        {docSlots[slotIndex][0].datetime.toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    )}
                  <p>
                    Price: {docInfo?.fees} {currencySymbol}
                  </p>
                </div>
              </div>

              <form className="booking-form" onSubmit={confirmBooking}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient's Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setName(value);

                        if (value.length >= 30) {
                          setNameError("Max name length is 30 characters");
                        } else {
                          setNameError("");
                        }
                      }}
                      className="form-control"
                      maxLength={30}
                      required
                    />
                    {nameError && <p className="error-message">{nameError}</p>}
                  </div>

                  <div className="form-group">
                    <label>Patient's Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPhone(value);
                          if (value.length !== 10) {
                            setPhoneError(
                              "Phone number must be exactly 10 characters long"
                            );
                          } else {
                            setPhoneError("");
                          }
                        }
                      }}
                      className="form-control"
                      required
                      maxLength={10}
                      inputMode="numeric"
                    />
                    {phoneError && (
                      <p className="error-message">{phoneError}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userData?.email}
                      className="form-control"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Patient's Address</label>
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAddress(value);
                        if (value.length >= 100) {
                          setAddressError(
                            "Max address length is 100 characters"
                          );
                        } else {
                          setAddressError("");
                        }
                      }}
                      className="form-control"
                      required
                      maxLength={100}
                    />
                    {addressError && (
                      <p className="error-message">{addressError}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Reasons for medical examination</label>
                    <input
                      type="text"
                      name="reason"
                      value={reason}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReason(value);
                        if (value.length >= 100) {
                          setReasonError("Max reason length is 100 characters");
                        } else {
                          setReasonError("");
                        }
                      }}
                      className="form-control"
                      required
                      maxLength={100}
                    />
                    {reasonError && (
                      <p className="error-message">{reasonError}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Patient's Date of Birth</label>
                    <DatePicker
                      selected={dob ? moment(dob, "YYYY-MM-DD").toDate() : null}
                      onChange={(date) =>
                        setDob(date ? moment(date).format("YYYY-MM-DD") : "")
                      }
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      yearDropdownItemNumber={120}
                      scrollableYearDropdown
                      isClearable
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Patient's Gender</label>
                    <select
                      name="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="form-control"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer flex justify-end gap-4">
                  <button type="submit" className="btn-confirm-booking">
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* ----- Feedback Section ----- */}
        </div>
        <div className="mt-8">
          <Feedback
            reviews={reviews}
            totalRating={docInfo.totalRating}
            addReview={addReview}
            deleteReview={deleteReview}
            setReviews={setReviews}
            updateDocInfo={updateDocInfo}
          />
        </div>
        {/* ----- Related Doctors ----- */}
        <RelatedDoctors doctorId={docId} specialty={docInfo?.specialty} />
      </div>
    )
  );
};

export default Appointment;
