import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center bg-gray-100"
    >
      <div
        className="flex flex-col gap-4 m-auto items-start p-8 min-w-[340px] sm:min-w-96 rounded-xl
       bg-white text-[#5E5E5E] text-sm shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <p className="text-3xl font-bold m-auto mb-6">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p className="font-medium mb-1">Email</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DADADA] rounded-lg w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="w-full relative">
          <p className="font-medium mb-1">Password</p>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#DADADA] rounded-lg w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Enter your password"
          />
          <span
            className="absolute right-3 top-10 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button className="bg-primary text-white w-full py-3 rounded-lg text-base font-semibold mt-4 hover:bg-primary-dark transition-colors duration-300">
          Login
        </button>
        {state === "Admin" ? (
          <p className="mt-4 text-center w-full">
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer font-medium hover:text-primary-dark transition-colors duration-200"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
