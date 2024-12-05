import React from "react";
import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token, getUserProfile } =
    useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateUserProfile = async () => {
    setLoading(true);
    try {
      if (userData.name.length < 3 || userData.name.length > 15) {
        toast.error("Name must be between 3 and 15 characters long");
        setLoading(false);
        return;
      }

      if (userData.phone.length !== 10) {
        toast.error("Phone number must be exactly 10 characters long");
        setLoading(false);
        return;
      }

      if (userData.address.length > 80) {
        toast.error("Address must be 80 characters or less");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", userData.address);
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      image && formData.append("image", image);
      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        await getUserProfile();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm">
        {isEdit ? (
          <label htmlFor="image" className="w-36">
            <div className="inline-block relative cursor-pointer">
              <img
                className="w-36 rounded opacity-75"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""
              />
              <img
                className="w-10 absolute bottom-12 right-12"
                src={image ? "" : assets.upload_icon}
                alt=""
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
              className="w-36"
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )}

        {isEdit ? (
          <div>
            <input
              placeholder="Enter your name"
              className="text-3xl font-medium max-w-60 mt-4 w-full border border-gray-300 rounded-md p-1"
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              maxLength={15}
            />
            <div className="text-right text-sm text-gray-500">
              {15 - userData.name.length} / 15 characters remaining
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium text-3xl text-neutral-800 mt-4">
              {userData.name}
            </p>
          </div>
        )}

        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id: </p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Phone number: </p>
            {isEdit ? (
              <div>
                <input
                  className="w-full border border-gray-300 rounded-md p-1"
                  type="text"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  maxLength={10}
                />
                <div className="text-right text-sm text-gray-500">
                  {10 - userData.phone.length} / 10 characters remaining
                </div>
              </div>
            ) : (
              <p className="text-blue-400">{userData.phone}</p>
            )}
            <p className="font-medium">Address: </p>
            {isEdit ? (
              <div>
                <input
                  placeholder="Enter your address"
                  className="w-full border border-gray-300 rounded-md p-1"
                  type="text"
                  value={userData.address}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  maxLength={80}
                />
                <div className="text-right text-sm text-gray-500">
                  {80 - userData.address.length} / 80 characters remaining
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                {userData.address || "Not Selected"}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender: </p>
            {isEdit ? (
              <select
                className="max-w-20 bg-gray-100"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}
            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="max-w-28 bg-gray-100"
                type="date"
                value={userData.dob || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                max={new Date().toISOString().split("T")[0]}
              />
            ) : (
              <p className="text-gray-400">
                {userData.dob ? userData.dob : "Not Selected"}
              </p>
            )}
          </div>
        </div>

        <div className="button-group">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Information"}
            </button>
          ) : (
            <>
              <button
                className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                onClick={() => setIsEdit(true)}
              >
                Edit Information
              </button>
              <button
                className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                onClick={() => navigate("/change-password")}
              >
                Change Password
              </button>
            </>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;
