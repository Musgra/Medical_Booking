import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const PatientsList = () => {
  const { aToken, backendUrl, getAllPatients, patients } =
    useContext(AdminContext);

  const { calculateAge } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient._doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (aToken) {
      getAllPatients();
    }
  }, [aToken]);

  console.log(patients); // Check the output here

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
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_2.5fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>User</p>
          <p>Age</p>
          <p>Email </p>
          <p>Phone</p>
          <p>Gender</p>
          <p>Times</p>
        </div>

        {filteredPatients.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_2.5fr_1fr_1fr] 
          items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full" src={item._doc.image} alt="" />
              <p className="truncate">{item._doc.name}</p>
            </div>
            {/* if dob is "Not Selected" then show not set */}
            <p className="max-sm:hidden">
              {item._doc.dob === "Not Selected" // selected is on the l
                ? "Not set"
                : calculateAge(item._doc.dob)}
            </p>
            <p className="max-sm:hidden w-30 break-word">{item._doc.email}</p>
            <div className="flex items-center gap-2">
              <p>{item._doc.phone}</p>
            </div>
            <p className="max-sm:hidden">
              {item._doc.gender === "Not Selected"
                ? "Not set"
                : item._doc.gender}
            </p>
            <p className="max-sm:hidden">{item.appointmentCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsList;
