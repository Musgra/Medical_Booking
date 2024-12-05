import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const { profileData, getProfileData, dToken, setProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const updateProfileData = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      };
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return (
    profileData && (
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
                {isEdit ? (
                  <input
                    type="number"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={profileData.fees}
                  />
                ) : (
                  profileData.fees
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
                    value={profileData.address.line1}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    style={{ width: "300px" }}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                ) : (
                  profileData.address.line1
                )}
                <br />
                {isEdit ? (
                  <input
                    type="text"
                    value={profileData.address.line2}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    style={{ width: "300px" }}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                ) : (
                  profileData.address.line2
                )}
              </p>
            </div>

            <div className="flex gap-1 pt-2 font-semibold">
              <input
                onChange={() =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
                checked={profileData.available}
                type="checkbox"
              />
              <label htmlFor="">Available</label>
            </div>

            <div className="button-group">
              {isEdit ? (
                <button
                  onClick={updateProfileData}
                  className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white 
              transition-all duration-300"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEdit(true)}
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
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
