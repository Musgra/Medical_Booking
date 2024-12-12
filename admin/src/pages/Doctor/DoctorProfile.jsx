import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import ChangeProfile from "./ChangeProfile";

const DoctorProfile = () => {
  const { profileData, getProfileData, dToken, setProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const handleEditClick = () => {
    setIsEdit(true);
  };

  const handleCancelClick = () => {
    setIsEdit(false);
  };

  const handleSaveClick = async () => {
    setProfileData(profileData);
    setIsEdit(false);
    getProfileData();
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return (
    profileData &&
    (isEdit ? (
      <ChangeProfile onSave={handleSaveClick} onCancel={handleCancelClick} />
    ) : (
      <div className="w-full">
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* ----- Doc Info : name, degree, experience ----- */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.specialty}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full font-semibold">
                {profileData.experience}
              </button>
            </div>

            {/* ----- Doc About ----- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-700 font-semibold mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800">
                {profileData.fees}
                {currency}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p className="text-gray-700 font-semibold">Address:</p>
              <p className="text-sm mt-0.5">{profileData.address}</p>
            </div>

            <div className="flex gap-1 pt-2 font-semibold">
              <input checked={profileData.available} readOnly type="checkbox" />
              <label htmlFor="">Available</label>
            </div>

            <div className="button-group">
              {
                <>
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white 
              transition-all duration-300
            "
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate("/change-doctor-password")}
                    className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white 
              transition-all duration-300"
                  >
                    Change Password
                  </button>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    ))
  );
};

export default DoctorProfile;
