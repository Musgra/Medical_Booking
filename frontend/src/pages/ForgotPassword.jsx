import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/"); 
    }
  }, [token, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/forgot-password",
        { params: { email } }
      );
      if (data.success) {
        toast.success(data.message);
        setDone(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="flex flex-col gap-3 items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <h3 className="text-2xl font-bold mb-2">Forgot Password</h3>
        {!done && (
          <p className="mb-6 ">
            Enter your email and we'll send you the instructions.
          </p>
        )}
        {done ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">
              An email has been sent to your email. Please follow the instructions in that email to reset your password.
            </span>
          </div>
        ) : (
          <form onSubmit={onSubmitHandler} className="w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
