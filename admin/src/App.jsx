import { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import PatientsList from "./pages/Admin/PatientsList";
import GetDoctorProfile from "./pages/Admin/GetDoctorProfile";

import { DoctorContext } from "./context/DoctorContext";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import ChangeDoctorPassword from "./pages/Doctor/ChangePasswordForm";
import AdminReviewList from "./pages/Admin/AdminReviewList";
import DoctorPatientList from "./pages/Doctor/DoctorPatientList";
import PatientDetails from "./pages/Doctor/PatientDetails";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return aToken || dToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex">
        <Sidebar />
        <Routes>
          {/* Admin Routes */}
          {aToken && (
            <>
              <Route path="/" element={<Navigate to="/admin-dashboard" />} />
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/patients-list" element={<PatientsList />} />
              <Route path="/doctor-list/:id" element={<GetDoctorProfile />} />
              <Route path="/admin-reviews" element={<AdminReviewList />} />
            </>
          )}
          {/* Doctor Routes */}
          {dToken && (
            <>
              <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route
                path="/doctor-appointments"
                element={<DoctorAppointments />}
              />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route
                path="/change-doctor-password"
                element={
                  <div className="flex-grow flex items-center justify-center bg-[#F8F9FD]">
                    <div className="w-full max-w-3xl">
                      <ChangeDoctorPassword />
                    </div>
                  </div>
                }
              />
              <Route path="/doctor-patients" element={<DoctorPatientList />} />
              <Route path="/doctor-patient/:userId" element={<PatientDetails />} />
            </>
          )}
          {/* Catch-all route for logged-in users */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />
        {/* Catch-all route for unauthenticated users */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
