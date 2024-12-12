import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { formatDate } from "../utils/formatDate";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const formatNotificationType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const {
    dToken,
    setDToken,
    fetchNotifications,
    notifications,
    setNotifications,
    markAllAsRead,
    backendUrl,
  } = useContext(DoctorContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const handleNotificationClick = async (notification) => {
    try {
      // Gọi API để cập nhật trạng thái isRead
      const { data } = await axios.put(
        backendUrl + `/api/doctor/notifications/${notification._id}/markAsRead`,
        {},
        {
          headers: {
            dToken: dToken,
          },
        }
      );

      if (data.success) {
        const updatedNotifications = notifications.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        navigate("/doctor-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  const navigate = useNavigate();
  const socket = io("http://localhost:4000");

  useEffect(() => {
    if (dToken) {
      const decodedToken = jwtDecode(dToken);
      const docId = decodedToken.id;
      socket.emit("joinDoctorRoom", docId);
      socket.on("newNotification", () => {
        fetchNotifications();
        console.log("123");
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [dToken]);

  useEffect(() => {
    if (dToken) fetchNotifications();
  }, [dToken]);

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setDToken("");
    dToken && localStorage.removeItem("dToken");
  };

  const typeActions = {
    appointment_request: "requested appointment",
    appointment_cancelled_by_user: "cancelled appointment",
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
      {(aToken || dToken) && (
        <div className="flex items-center gap-5">
          {dToken && (
            <div
              className="notification-bell cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={assets.bell_icon} alt="Notifications" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              {notifications.length > 0 && (
                <div
                  className={`notification-dropdown ${
                    showDropdown ? "block" : "hidden"
                  }`}
                >
                  <div className="notification-header">
                    Notifications
                    <button
                      className="mark-all-read"
                      onClick={() => {
                        markAllAsRead();
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>{" "}
                  <div className="notification-list">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification._id}
                        className={`notification-item ${
                          notification.isRead ? "bg-gray-200" : "bg-white"
                        } hover:bg-gray-300 cursor-pointer transition-colors duration-300`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-text">
                          <p>
                            <strong>
                              {" "}
                              {formatNotificationType(notification.type)}{" "}
                            </strong>
                          </p>
                          <p>
                            <strong>
                              {notification.message.split(" has")[0]}
                            </strong>{" "}
                            has{" "}
                            <span
                              className={`notification-action ${
                                notification.type ===
                                "appointment_cancelled_by_user"
                                  ? "text-red-500"
                                  : notification.type === "appointment_request"
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {typeActions[notification.type]}
                            </span>{" "}
                            at {notification.message.split(" at ")[1]}
                          </p>
                        </div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleString(
                            "en-GB",
                            {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={logout}
            className="bg-primary text-white text-sm sm:text-base px-6 sm:px-10 py-1 sm:py-2 rounded-full"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
