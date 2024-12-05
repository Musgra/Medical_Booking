import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { formatDate } from "../utils/formatDate";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const socket = io("http://localhost:4000");

  useEffect(() => {
    if (dToken) {
      const decodedToken = jwtDecode(dToken);
      const docId = decodedToken.id;
      socket.emit("joinDoctorRoom", docId);

      socket.on("newAppointment", (data) => {
        if (data.docId === docId) {
          setNotifications((prev) => [
            ...prev,
            `Patient ${
              data.patientName
            } has booked an appointment on ${formatDate(
              data.slotDate,
              data.slotTime
            )}`,
          ]);
          setNotificationCount((prev) => prev + 1);
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [dToken]);

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setDToken("");
    dToken && localStorage.removeItem("dToken");
  };
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img
          className="w-36 sm:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <div
          className="notification-bell relative"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img src={assets.bell_icon} alt="Notifications" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
          {notifications.length > 0 && (
            <div
              className={`notification-dropdown ${
                showDropdown ? "block" : "hidden"
              }`}
            >
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  {notification}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="bg-primary text-white text-sm sm:text-base px-6 sm:px-10 py-1 sm:py-2 rounded-full"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
