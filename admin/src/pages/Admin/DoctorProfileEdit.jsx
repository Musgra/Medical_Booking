import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { useParams } from "react-router-dom";
import { experienceOptions, specialtyOptions } from "../../utils/options";
import Modal from "react-modal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

Modal.setAppElement("#root");

const DoctorProfileEdit = ({ onSave, onCancel }) => {
  const { id } = useParams();
  const {
    doctorProfileData,
    backendUrl,
    aToken,
    getDoctorProfileData,
    setDoctorProfileData,
  } = useContext(AdminContext);
  const [docImg, setDocImg] = useState(doctorProfileData.image || null);
  const [name, setName] = useState(doctorProfileData.name || "");
  const [experience, setExperience] = useState(
    doctorProfileData.experience || "1 Year"
  );
  const [fees, setFees] = useState(doctorProfileData.fees || "");
  const [about, setAbout] = useState(doctorProfileData.about || "");
  const [specialty, setSpecialty] = useState(
    doctorProfileData.specialty || "General physician"
  );
  const [degree, setDegree] = useState(doctorProfileData.degree || "");
  const [address, setAddress] = useState(doctorProfileData.address || "");

  const [available, setAvailable] = useState(
    doctorProfileData.available || false
  );
  const [phone, setPhone] = useState(doctorProfileData.phone || "");
  const [email, setEmail] = useState(doctorProfileData.email || "");
  const [phoneError, setPhoneError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (!docImg) {
        return toast.error("Please upload doctor picture");
      }

      if (phone.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("specialty", specialty);
      formData.append("degree", degree);
      formData.append("address", address);
      formData.append("available", available);
      formData.append("phone", phone);
      if (docImg instanceof File) {
        formData.append("image", docImg);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/admin/doctor-list/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            aToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setDoctorProfileData({
          ...doctorProfileData,
          image: docImg instanceof File ? URL.createObjectURL(docImg) : docImg,
          name,
          experience,
          fees,
          about,
          specialty,
          degree,
          address,
          available,
          phone,
          email,
        });
        onSave();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/reset-password/${id}`,
        { password: newPassword },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Password reset successfully");
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset password");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full" autoComplete="off">
      <p className="mb-3 text-lg font-medium">Edit Doctor Profile</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={
                docImg instanceof File
                  ? URL.createObjectURL(docImg)
                  : doctorProfileData.image
              }
              alt=""
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Name"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor's Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Email"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
                name="experience"
                id="experience"
              >
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Fees"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Specialty</p>
              <select
                onChange={(e) => setSpecialty(e.target.value)}
                value={specialty}
                className="border rounded px-3 py-2"
                name="specialty"
                id="specialty"
              >
                {specialtyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Education"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Address"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <p>Doctor Phone</p>
          <input
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d*$/.test(value)) {
                setPhoneError("Only numbers are allowed");
                return;
              }
              if (value.length > 10) {
                setPhoneError("Phone number must be exactly 10 digits."); // Quá 10 ký tự
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
          />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
        </div>

        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 pt-2 border rounded"
            placeholder="Write about doctor ..."
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              resize: "none",
            }}
            rows={5}
            required
          />
        </div>

        <div className="flex gap-1 pt-2 font-semibold">
          <input
            type="checkbox"
            checked={available}
            onChange={() => setAvailable(!available)}
          />
          <label htmlFor="">Available</label>
        </div>

        <div className="flex-1 flex flex-col gap-1 mt-3">
          <p>Reset Doctor's Password</p>
          <button
            type="button"
            onClick={() => setModalIsOpen(true)}
            className="bg-gray-300 px-5 py-2 rounded-full text-gray-700 mt-1"
          >
            Reset Password
          </button>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Reset Password Modal"
          className="modal"
          overlayClassName="overlay"
        >
          <h2 className="mb-4 text-lg font-bold">Reset Password</h2>

          <div className="relative mb-3">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="New Password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative mb-3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleResetPassword}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
            >
              Save Password
            </button>
            <button
              onClick={() => {
                closeModal();
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </Modal>

        <div className="flex gap-4 mt-3">
          <button
            type="submit"
            className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
          >
            Save
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-10 py-3 mt-4 text-gray-700 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default DoctorProfileEdit;
