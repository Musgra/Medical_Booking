import { AdminContext } from "../../context/AdminContext";
import { useContext, useEffect } from "react";
import React, { useState } from "react";
import "../../index.css";
import { useNavigate } from "react-router-dom";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } =
    useContext(AdminContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesName = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? doctor.specialty === selectedSpecialty : true;
    return matchesName && matchesSpecialty;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  const uniqueSpecialties = [...new Set(doctors.map((doctor) => doctor.specialty))];

  return (
    aToken && (
      <div className="m-5 max-h-[90vh] ">
        <div>
          <p className="text-lg font-medium mb-3">All Doctors</p>
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
          <div className="mb-4">
            <label htmlFor="specialty" className="text-sm font-medium mr-2">Filter by Specialty:</label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="">All Specialties</option>
              {uniqueSpecialties.map((specialty, index) => (
                <option key={index} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="doctor-list">
          {filteredDoctors.map((item, index) => (
            <div
              className="doctor-card relative border border-indigo-200 rounded-xl overflow-hidden cursor-pointer group"
              key={index}
              onClick={() => navigate(`/doctor-list/${item._id}`)}
            >
              <img
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
                src={item.image}
                alt=""
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">
                  {item.name}
                </p>
                <p className="text-zinc-600 text-sm">{item.specialty}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={item.available} readOnly />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default DoctorsList;
