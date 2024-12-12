import React, { useContext, useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

import { AppContext } from "../context/AppContext";

const NavBar = () => {
  const socket = io("http://localhost:4000");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const formatNotificationType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const {
    token,
    setToken,
    userData,
    patientNotifications,
    notifications,
    setNotifications,
    markAllAsRead,
    backendUrl,
  } = useContext(AppContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      socket.emit("joinUserRoom", userId);
      socket.on("newNotification", () => {
        patientNotifications();
        console.log("12345");
      });
      return () => {
        socket.off("newNotification");
      };
    }
  }, [token]);
  useEffect(() => {
    if (token) {
      patientNotifications();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const typeActions = {
    appointment_accepted: "accepted appointment",
    appointment_cancelled_by_doctor: "cancelled appointment",
    appointment_completed: "completed appointment",
  };

  const handleNotificationClick = async (notification) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/api/user/notifications/${notification._id}/markAsRead`,
        {},
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        const updatedNotifications = notifications.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        navigate("/my-appointments");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt=""
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        {token && userData ? (
          <>
            <div ref={dropdownRef} className="relative z-50">
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
                                  "appointment_cancelled_by_doctor"
                                    ? "text-red-500"
                                    : notification.type ===
                                      "appointment_accepted"
                                    ? "text-green-500"
                                    : notification.type ===
                                      "appointment_completed"
                                    ? "text-blue-500"
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
            </div>
            <div
              ref={menuRef}
              className="flex items-center gap-2 cursor-pointer group relative"
            >
              <img
                className="w-8 rounded-full"
                src={userData.image}
                onClick={() => setShowMenu(!showMenu)}
                alt=""
              />
              <img
                className="w-2.5"
                src={assets.dropdown_icon}
                onClick={() => setShowMenu(!showMenu)}
                alt=""
              />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-30 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={logout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create Account
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/* Mobile Menu */}
        <div
          className={` ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink to="/" onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink to="/doctors" onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink to="/about" onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink to="/contact" onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
