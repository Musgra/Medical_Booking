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

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    const day = dateArray[0].padStart(2, "0");
    const month = dateArray[1].padStart(2, "0");
    const year = dateArray[2];
    return `${day}/${month}/${year}`;
  };

  const addReview = (review) => {
    setReviews((prevReviews) => [...prevReviews, review]);
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
    slotDateFormat,
    addReview,
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