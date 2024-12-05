import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { useParams } from "react-router-dom";
import { experienceOptions, specialtyOptions } from "../../utils/options";

const DoctorProfileEdit = ({ onSave }) => {
  const { id } = useParams();
  const {
    doctorProfileData,
    backendUrl,
    aToken,
    getDoctorProfileData,
    setDoctorProfileData,
  } = useContext(AdminContext);
  const [docImg, setDocImg] = useState(doctorProfileData.image || null);
  const [name, setName] = useState(doctorProfileData.name || "");
  const [experience, setExperience] = useState(
    doctorProfileData.experience || "1 Year"
  );
  const [fees, setFees] = useState(doctorProfileData.fees || "");
  const [about, setAbout] = useState(doctorProfileData.about || "");
  const [specialty, setSpecialty] = useState(
    doctorProfileData.specialty || "General physician"
  );
  const [degree, setDegree] = useState(doctorProfileData.degree || "");
  const [address1, setAddress1] = useState(
    doctorProfileData.address.line1 || ""
  );
  const [address2, setAddress2] = useState(
    doctorProfileData.address.line2 || ""
  );
  const [available, setAvailable] = useState(doctorProfileData.available || false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (!docImg) {
        return toast.error("Please upload doctor picture");
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("specialty", specialty);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );
      formData.append("available", available);

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const { data } = await axios.put(
        backendUrl + `/api/admin/doctor-list/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            aToken,
          },
        }
      );
      

      if (data.success) {
        toast.success(data.message);
        setDoctorProfileData({
          ...doctorProfileData,
          image: docImg,
          name,
          experience,
          fees,
          about,
          specialty,
          degree,
          address: { line1: address1, line2: address2 },
          available,
        });

        console.log("doctorProfileData", doctorProfileData);
        onSave(); // Call the onSave prop to navigate back
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("doctorProfileData", doctorProfileData);
  }, [doctorProfileData]);

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full" autoComplete="off">
      <p className="mb-3 text-lg font-medium">Edit Doctor Profile</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={
                docImg instanceof File
                  ? URL.createObjectURL(docImg)
                  : doctorProfileData.image
              }
              alt=""
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Name"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
                name="experience"
                id="experience"
              >
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Fees"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Specialty</p>
              <select
                onChange={(e) => setSpecialty(e.target.value)}
                value={specialty}
                className="border rounded px-3 py-2"
                name="specialty"
                id="specialty"
              >
                {specialtyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Education"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Address 1"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Address 2"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 pt-2 border rounded"
            placeholder="Write about doctor ..."
            rows={5}
            required
          />
        </div>

        <div className="flex gap-1 pt-2 font-semibold">
          <input
            type="checkbox"
            checked={available}
            onChange={() => setAvailable(!available)}
          />
          <label htmlFor="">Available</label>
        </div>

        <button
          type="submit"
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default DoctorProfileEdit;
