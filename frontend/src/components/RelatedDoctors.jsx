import React from "react";
import { AppContext } from "../context/AppContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const RelatedDoctors = ({ doctorId, specialty }) => {
  const { doctors, getDoctorsData, currencySymbol } = useContext(AppContext);
  const navigate = useNavigate();

  const [relatedDoctors, setRelatedDoctors] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && specialty) {
      const doctorsData = doctors.filter(
        (doctor) => doctor.specialty === specialty && doctor._id !== doctorId
      );
      setRelatedDoctors(doctorsData);
    }
  }, [doctors, specialty, doctorId]);
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relatedDoctors.slice(0, 5).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            key={item._id}
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
              <p className="text-gray-900 text-lg font-medium">{item.name}</p>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">{item.specialty}</p>
                <div className="flex items-center gap-1">
                  <p className="flex items-center gap-1">
                    <img
                      className="w-[15px] h-[15px]"
                      src={assets.star_icon}
                      alt=""
                    />
                    {item.averageRating.toFixed(1)}
                  </p>
                  <p className="text-gray-600 text-sm">({item.totalRating})</p>
                </div>
              </div>
              <p className="font-medium text-sm break-word mt-1.5">
                Booking Price: {item.fees.toLocaleString()} {currencySymbol}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-primary text-white px-12 py-3 rounded-full mt-10"
      >
        View More
      </button>
    </div>
  );
};

export default RelatedDoctors;
