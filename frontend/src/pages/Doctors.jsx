import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import "../index.css";

const Doctors = () => {
  const { specialty } = useParams();
  const [filterDoctor, setFilterDoctor] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState("averageRating");

  const navigate = useNavigate();
  const { doctors, currencySymbol } = useContext(AppContext);

  const handleNavigate = (selectedSpecialty) => {
    if (specialty === selectedSpecialty) {
      navigate("/doctors");
    } else {
      navigate(`/doctors/${selectedSpecialty}`);
    }
  };

  const applyFilter = () => {
    let filtered = [...doctors];

    if (specialty) {
      filtered = filtered.filter((doc) => doc.specialty === specialty);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortCriteria === "fees") {
        return b.fees - a.fees;
      } else if (sortCriteria === "feesLow") {
        return a.fees - b.fees;
      } else if (sortCriteria === "averageRating") {
        if (b.averageRating === a.averageRating) {
          return b.totalRating - a.totalRating;
        }
        return b.averageRating - a.averageRating;
      } else if (sortCriteria === "totalRating") {
        return b.totalRating - a.totalRating;
      }
      return 0;
    });

    setFilterDoctor(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, specialty, searchTerm, sortCriteria]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Browse through the doctors specialist</p>

        <div className="flex justify-between items-center mb-4 w-full sort-search-container">
          <div className="flex items-center gap-2 w-full ml-1 sort-container">
            <p className="whitespace-nowrap">Sort by:</p>
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="averageRating">Average Rating</option>
              <option value="totalRating">Total Rating</option>
              <option value="fees">Price: High to Low</option>
              <option value="feesLow">Price: Low to High</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by name or specialty"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full sm:w-1/2"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? "bg-primary text-white" : ""
          }`}
          onClick={() => setShowFilter(!showFilter)}
        >
          Filters
        </button>
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          <p
            onClick={() => handleNavigate("General physician")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "General physician"
                ? "bg-indigo-100 text-black"
                : ""
            }`}
          >
            General Physician
          </p>
          <p
            onClick={() => handleNavigate("Gynecologist")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "Gynecologist" ? "bg-indigo-100 text-black" : ""
            }`}
          >
            Gynecologist
          </p>
          <p
            onClick={() => handleNavigate("Dermatologist")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "Dermatologist" ? "bg-indigo-100 text-black" : ""
            }`}
          >
            Dermatologist
          </p>
          <p
            onClick={() => handleNavigate("Pediatricians")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "Pediatricians" ? "bg-indigo-100 text-black" : ""
            }`}
          >
            Pediatricians
          </p>
          <p
            onClick={() => handleNavigate("Neurologist")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "Neurologist" ? "bg-indigo-100 text-black" : ""
            }`}
          >
            Neurologist
          </p>
          <p
            onClick={() => handleNavigate("Gastroenterologist")}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              specialty === "Gastroenterologist"
                ? "bg-indigo-100 text-black"
                : ""
            }`}
          >
            Gastroenterologist
          </p>
        </div>
        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoctor.length === 0 ? (
            <p className="text-center text-gray-500">
              No doctor or specialty found
            </p>
          ) : (
            filterDoctor.map((item, index) => (
              <div
                onClick={() => navigate(`/appointment/${item._id}`)}
                key={index}
                className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px]
              transition-all duration-500"
              >
                <img className="bg-blue-200" src={item.image} alt="" />
                <div className="p-4">
                  <div
                    className={`flex items-center gap-2 text-sm text-center ${
                      item.available ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    <p
                      className={`w-2 h-2 ${
                        item.available ? "bg-green-500" : "bg-gray-500"
                      } rounded-full`}
                    ></p>
                    <p>{item.available ? "Available" : "Not Available"}</p>
                  </div>
                  <p className="text-gray-900 text-lg font-medium">
                    {item.name}
                  </p>
                  <div className="flex justify-between items-center doctor-info">
                    <p className="text-gray-600 text-sm specialty">
                      {item.specialty}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="flex items-center gap-1">
                        <img
                          className="w-[15px] h-[15px]"
                          src={assets.star_icon}
                          alt=""
                        />
                        {item.averageRating.toFixed(1)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        ({item.totalRating})
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-sm break-word">
                    Booking Price: {item.fees.toLocaleString()} {currencySymbol}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
