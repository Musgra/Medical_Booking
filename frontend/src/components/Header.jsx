import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20">
      {/* -----Left side----- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Book Appointments <br /> With Trusted Doctor
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-28" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block" />
            schedule your appointment hassle-free.
          </p>
        </div>
        <a
          href="#specialty"
          className="flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 
          transition-all duration-300"
        >
          Book appointment
          <img className="w-3" src={assets.arrow_icon} alt="" />
        </a>

        <div className="mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row gap-6 lg:gap-[15px] text-white ">
          <div>
            <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] ">
              30+
            </h2>
            <span className="w-[70px] h-2 bg-yellowColor rounded-full block mt-[-14px]"></span>
            <p className="text_para">Yrs. Experience</p>
          </div>
          <div>
            <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] ">
              15+
            </h2>
            <span className="w-[70px] h-2 bg-purpleColor rounded-full block mt-[-14px]"></span>
            <p className="text_para">Clinic location</p>
          </div>
          <div>
            <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] ">
              100%
            </h2>
            <span className="w-[70px] h-2 bg-irisBlueColor rounded-full block mt-[-14px]"></span>
            <p className="text_para">Patient Satisfaction</p>
          </div>
        </div>
      </div>

      {/* -----Right side----- */}
      <div className="md:w-1/2 relative">
        <img
          className="w-full md:absolute bottom-0 h-auto rounded-lg"
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Header;