import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const DoctorDashboard = () => {
  const {
    dashboardData,
    setDashboardData,
    getDashboardData,
    dToken,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashboardData();
    }
  }, [dToken]);

  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer 
          hover:scale-105 transition-all"
        >
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.earnings} {currency}
            </p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer 
          hover:scale-105 transition-all"
        >
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.completedAppointments}
            </p>
            <p className="text-gray-400">Appointments Done</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer 
          hover:scale-105 transition-all"
        >
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboardData.patients}
            </p>
            <p className="text-gray-400">Users</p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4 border border-t-0">
          {dashboardData.latestAppointments ? (
            dashboardData.latestAppointments.map((item, index) => (
              <div
                className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
                key={index}
              >
                <img
                  className="rounded-full w-10"
                  src={item.userData.image}
                  alt=""
                />
                <div className="flex-1 text-sm">
                  <p className="text-gray-800 font-semibold">
                    {item.userData.name}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-gray-800">
                      {slotDateFormat(item.slotDate)}
                    </p>
                    <p className="text-gray-800 sm:ml-2">{item.slotTime}</p>
                  </div>
                </div>
                {item.cancelled ? (
                  <p className="text-xs text-red-500 font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-xs text-green-500 font-medium">
                    Completed
                  </p>
                ) : item.isPending ? (
                  <p className="text-xs text-yellow-500 font-medium">Pending</p>
                ) : (
                  <p className="text-xs text-blue-500 font-medium">Upcoming</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No appointments available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
