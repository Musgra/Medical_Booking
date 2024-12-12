import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";

const DoctorPatientList = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/patients`, {
          headers: { dToken },
        });
        if (data.success) {
          setPatients(data.patients);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchPatients();
  }, [dToken]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full m-5">
      <div>
        <p className="text-lg font-medium mb-3">All Users</p>
        <div className="flex mb-4 items-center">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={() => setSearchQuery("")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Header Row */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_2fr_3fr_2fr_2fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>User</p>
          <p>Phone</p>
          <p>Email</p>
          <p>Completed</p>
          <p>Cancelled</p>
        </div>

        {/* Data Rows */}
        {filteredPatients.map((patient, index) => (
          <Link to={`/doctor-patient/${patient._id}`} key={index}>
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_2fr_3fr_2fr_2fr] 
              items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-100"
            >
              {/* Số thứ tự */}
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Tên và ảnh */}
              <div className="flex items-center gap-2">
                <img className="w-8 rounded-full" src={patient.image} alt="" />
                <div>
                  <p className="break-word">{patient.name}</p>
                  {patient.isBlocked && (
                    <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-md inline-block mt-1">
                      Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="max-sm:w-full">
                <p className="text-xs text-gray-400 max-sm:block sm:hidden">
                  Phone
                </p>
                <p className="break-word">{patient.phone}</p>
              </div>

              {/* Email */}
              <div className="max-sm:w-full">
                <p className="text-xs text-gray-400 max-sm:block sm:hidden">
                  Email
                </p>
                <p className="break-word text-gray-700 font-medium">
                  {patient.email}
                </p>
              </div>

              {/* Số lượng hoàn thành */}
              <div className="max-sm:w-full">
                <p className="text-xs text-gray-400 max-sm:block sm:hidden">
                  Completed
                </p>
                <p>{patient.completed}</p>
              </div>

              {/* Số lượng hủy */}
              <div className="max-sm:w-full">
                <p className="text-xs text-gray-400 max-sm:block sm:hidden">
                  Cancelled
                </p>
                <p>{patient.cancelled}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorPatientList;
