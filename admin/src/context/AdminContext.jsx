import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientDetails, setPatientDetails] = useState([]);
  const [appointmentsDetails, setAppointmentsDetails] = useState([]);
  const [doctorProfileData, setDoctorProfileData] = useState([]);
  const [reviews, setReviews] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // not sending any data in body => {}
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/block-user",
        { userId, isBlocked },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getPatientDetails(userId);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        {
          headers: {
            aToken,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: {
          aToken,
        },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllPatients = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/patients-list",
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getPatientDetails = async (userId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/admin/patient-details/${userId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setPatientDetails(data.patients);
        setAppointmentsDetails(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDoctorProfileData = async (id) => {
    try {
      if (!id) {
        toast.error("Doctor ID is missing ");
        return;
      } else {
      }
      const { data } = await axios.get(
        backendUrl + `/api/admin/doctor-list/${id}`,
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setDoctorProfileData(data.doctorProfileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteDoctor = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllReviews = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/reviews/admin/all-reviews",
        { headers: { aToken } }
      );
      if (data.success) {
        setReviews(data.reviews);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/reviews/admin/${reviewId}/delete-review`,
        {
          headers: {
            "Content-Type": "application/json",
            aToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAllReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    getDashboardData,
    dashboardData,
    getAllPatients,
    patients,
    getPatientDetails,
    patientDetails,
    appointmentsDetails,
    setAppointmentsDetails,
    deleteDoctor,
    doctorProfileData,
    getDoctorProfileData,
    setDoctorProfileData,
    getAllReviews,
    deleteReview,
    reviews,
    handleBlockUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};
export default AdminContextProvider;
