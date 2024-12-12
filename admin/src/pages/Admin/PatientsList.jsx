import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const PatientsList = () => {
  const { aToken, backendUrl, getAllPatients, patients } =
    useContext(AdminContext);

  const { calculateAge } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (aToken) {
      getAllPatients();
    }
  }, [aToken]);

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
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_2fr_3fr_2fr_2fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>User</p>
          <p>Phone</p>
          <p>Email</p>
          <p>Completed</p>
          <p>Cancelled</p>
        </div>

        {filteredPatients.map((item, index) => (
          <Link to={`/patient-details/${item._id}`} key={index}>
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_2fr_3fr_2fr_2fr] 
              items-center text-gray-700 font-medium py-3 px-6 border-b hover:bg-gray-100"
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full bg-gray-200"
                  src={item.image}
                  alt=""
                />
                <div>
                  <p className="truncate">{item.name}</p>
                  {item.isBlocked && (
                    <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-md inline-block mt-1">
                      Blocked
                    </span>
                  )}
                </div>
              </div>

              <div className="max-sm:w-full">
                <p className="text-xs text-gray-700  max-sm:block sm:hidden">
                  Phone
                </p>
                <p className="break-word ">{item.phone}</p>
              </div>

              <div className="max-sm:w-full">
                <p className="text-xs text-gray-700 max-sm:block sm:hidden">
                  Email
                </p>
                <p className="break-word text-gray-700 font-semibold">
                  {item.email}
                </p>
              </div>

              <div className="max-sm:w-full">
                <p className="text-xs text-gray-700 max-sm:block sm:hidden">
                  Completed
                </p>
                <p>{item.completedAppointments}</p>
              </div>
              <div className="max-sm:w-full">
                <p className="text-xs text-gray-700 max-sm:block sm:hidden">
                  Cancelled
                </p>
                <p>{item.cancelledAppointments}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PatientsList;
