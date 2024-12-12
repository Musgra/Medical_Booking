import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/check-token/${token}`
        );
        if (!data.success) {
          setTokenError(true);
        }
      } catch (error) {
        setTokenError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkTokenValidity();
  }, [backendUrl, token]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/reset-password/${token}`,
        {
          token,
          newPassword,
        }
      );
      if (data.success) {
        setSuccessMessage(
          "Your password has been updated. You can now log in using your new password!"
        );
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setTokenError(true);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (successMessage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Success</h1>
          <p>{successMessage}</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Your link is invalid or expired
          </h1>
          <p>Please request a new password reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
      <div className="bg-white p-8 rounded-lg w-full max-w-md border text-zinc-600 text-sm shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              className="absolute right-3 top-10 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
