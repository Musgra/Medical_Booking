import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";

const ChangeProfile = ({ onSave, onCancel }) => {
  const { profileData, setProfileData, backendUrl, dToken } =
    useContext(DoctorContext);

  const [docImg, setDocImg] = useState(profileData.image || null);
  const [name, setName] = useState(profileData.name || "");
  const [address, setAddress] = useState(profileData.address || "");
  const [phone, setPhone] = useState(profileData.phone || "");
  const [available, setAvailable] = useState(profileData.available || false);
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!docImg) {
        setLoading(false);
        return toast.error("Please upload doctor picture");
      }
      if (phone.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("docId", profileData._id);
      formData.append("name", name);
      formData.append("address", address);
      formData.append("phone", phone);
      formData.append("available", available);
      if (docImg instanceof File) {
        formData.append("image", docImg);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            dToken,
          },
        }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        setProfileData({
          ...profileData,
          name,
          address,
          phone,
          available,
          image: docImg instanceof File ? URL.createObjectURL(docImg) : docImg,
        });
        onSave();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="m-5 w-full" autoComplete="off">
      <p className="mb-3 text-lg font-medium">Edit Profile</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="docImg">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={
                docImg instanceof File
                  ? URL.createObjectURL(docImg)
                  : profileData.image
              }
              alt="Doctor"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="docImg"
            hidden
          />
          <p>Upload picture</p>
        </div>

        <div className="flex flex-col gap-4 text-gray-600">
          <div className="flex flex-col gap-1">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="border rounded px-3 py-2"
              type="text"
              placeholder="Name"
              required
              maxLength={30}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Address</p>
            <input
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              className="border rounded px-3 py-2"
              type="text"
              placeholder="Address"
              required
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Phone</p>
            <input
              onChange={(e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) {
                  setPhoneError("Only numbers are allowed");
                  return;
                }
                if (value.length > 10) {
                  setPhoneError("Phone number must be exactly 10 digits.");
                  return;
                }
                setPhoneError("");
                setPhone(value);
              }}
              value={phone}
              className="border rounded px-3 py-2"
              type="text"
              placeholder="Phone"
              required
              maxLength={10}
              disabled={loading}
            />
            {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          </div>
          <div className="flex gap-1 pt-2 font-semibold">
            <input
              type="checkbox"
              checked={available}
              onChange={() => setAvailable(!available)}
              disabled={loading}
            />
            <label htmlFor="">Available</label>
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <button
            type="submit"
            className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}{" "}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-10 py-3 mt-4 text-gray-700 rounded-full"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChangeProfile;
