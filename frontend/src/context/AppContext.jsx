import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currencySymbol = "VND";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || false);
  const [userData, setUserData] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const addReview = (review) => {
    setReviews((prevReviews) => [...prevReviews, review]);
  };

  const createNotification = async (notification) => {
    const { data } = await axios.post(backendUrl + "/api/notifications", {
      headers: { token },
      notification,
    });
    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  const patientNotifications = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/notifications", {
        headers: { token },
      });
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/mark-all-as-read`,
        {},
        {
          headers: { token },
        }
      );
      if (data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    setDoctors,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    getDoctorsData,
    getUserProfile,
    addReview,
    createNotification,
    notifications,
    setNotifications,
    patientNotifications,
    markAllAsRead,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setUserData(false);
    }
  }, [token]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
