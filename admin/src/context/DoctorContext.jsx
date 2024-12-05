import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        {
          headers: { dToken },
        }
      );
      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const acceptAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/accept-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        //update data
        getAppointments();
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
        console.log(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
        console.log(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const sendRemedyToPatient = async (appointmentId, remedyImage) => {
    try {
      const formData = new FormData();
      formData.append("appointmentId", appointmentId);
      formData.append("image", remedyImage);

      // Decode the token to get the docId
      const decodedToken = jwtDecode(dToken);
      const docId = decodedToken.id;
      formData.append("docId", docId);

      const { data } = await axios.post(
        backendUrl + "/api/doctor/send-remedy",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            dToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const viewRemedy = async (appointmentId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/get-remedy/${appointmentId}`,
        {
          headers: { dToken },
        }
      );

      if (data.success) {
        return data.remedyImage;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return null;
    }
  };

  const fetchNotifications = async() =>{
    
  }

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    acceptAppointment,
    dashboardData,
    setDashboardData,
    getDashboardData,
    profileData,
    setProfileData,
    getProfileData,
    sendRemedyToPatient,
    viewRemedy,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
