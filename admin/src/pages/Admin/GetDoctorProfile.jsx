import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import DoctorProfileEdit from "./DoctorProfileEdit";
import Modal from "react-modal";

Modal.setAppElement("#root");

const GetDoctorProfile = () => {
  const { id } = useParams();
  if (!id || id.length !== 24) {
    toast.error("Invalid doctor ID");
  }
  const {
    doctorProfileData,
    getDoctorProfileData,
    setDoctorProfileData,
    backendUrl,
    aToken,
  } = useContext(AdminContext);
  const { currency } = useContext(AppContext);
  const { deleteDoctor } = useContext(AdminContext);
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleEditClick = () => {
    setIsEdit(true);
    console.log(doctorProfileData);
  };

  const handleSaveClick = async () => {
    setDoctorProfileData(doctorProfileData);
    setIsEdit(false);
    getDoctorProfileData(id);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleDelete = () => {
    if (id) {
      deleteDoctor(id);
      toast.success("Doctor deleted successfully");
      navigate("/doctor-list", { replace: true });
    }
    closeModal();
  };

  useEffect(() => {
    if (aToken && id) {
      console.log(id);
      console.log(doctorProfileData);
      getDoctorProfileData(id);
    }
  }, [aToken, id]);

  return (
    doctorProfileData &&
    (isEdit ? (
      <DoctorProfileEdit onSave={handleSaveClick} />
    ) : (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={doctorProfileData.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* ----- Doc Info : name, degree, experience ----- */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {doctorProfileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {doctorProfileData.degree} - {doctorProfileData.specialty}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full font-semibold">
                {doctorProfileData.experience}
              </button>
            </div>

            {/* ----- Doc About ----- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {doctorProfileData.about}
              </p>
            </div>

            <p className="text-gray-700 font-semibold mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800">
                {isEdit ? (
                  <input
                    type="number"
                    onChange={(e) =>
                      setDoctorProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={doctorProfileData.fees}
                  />
                ) : (
                  doctorProfileData.fees
                )}
                {currency}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p className="text-gray-700 font-semibold">Address:</p>
              <p className="text-sm mt-0.5">
                {isEdit ? (
                  <input
                    type="text"
                    value={doctorProfileData.address.line1}
                    onChange={(e) =>
                      setDoctorProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    style={{ width: "300px" }}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                ) : (
                  doctorProfileData.address.line1
                )}
                <br />
                {isEdit ? (
                  <input
                    type="text"
                    value={doctorProfileData.address.line2}
                    onChange={(e) =>
                      setDoctorProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    style={{ width: "300px" }}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                ) : (
                  doctorProfileData.address.line2
                )}
              </p>
            </div>

            <div className="flex gap-1 pt-2 font-semibold">
              <input
                onChange={() =>
                  isEdit &&
                  setDoctorProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
                checked={doctorProfileData.available}
                type="checkbox"
              />
              <label htmlFor="">Available</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white 
          transition-all duration-300"
              >
                Edit
              </button>
              <button
                onClick={openModal}
                className="px-4 py-1 border border-red-500 text-sm rounded-full mt-5 hover:bg-red-500 hover:text-white 
          transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Confirm Delete"
          className="modal"
          overlayClassName="overlay"
        >
          <p>Are you sure you want to delete this doctor?</p>
          <div className="modal-buttons">
            <button className="btn-confirm" onClick={handleDelete}>
              Yes
            </button>
            <button className="btn-cancel" onClick={closeModal}>
              No
            </button>
          </div>
        </Modal>
      </div>
    ))
  );
};

export default GetDoctorProfile;
