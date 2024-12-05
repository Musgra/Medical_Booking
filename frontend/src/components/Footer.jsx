import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { RiLinkedinFill } from "react-icons/ri";
import {
  AiFillYoutube,
  AiFillGithub,
  AiOutlineInstagram,
  AiOutlinePhone,
} from "react-icons/ai";

const socialLinks = [
  {
    icon: <RiLinkedinFill className="group-hover:text-white w-4 h-5" />,
    path: "https://www.linkedin.com/in/username",
  },
  {
    icon: <AiFillYoutube className="group-hover:text-white w-4 h-5" />,
    path: "https://www.youtube.com/channel/username",
  },
  {
    icon: <AiFillGithub className="group-hover:text-white w-4 h-5" />,
    path: "https://github.com/username",
  },
  {
    icon: <AiOutlineInstagram className="group-hover:text-white w-4 h-5" />,
    path: "https://www.instagram.com/username",
  },
];

const quickLinks01 = [
  {
    path: "/",
    display: "Home",
  },
  {
    path: "/about",
    display: "About Us",
  },
  {
    path: "/contact",
    display: "Contact us",
  },
  {
    path: "/",
    display: "Privacy Policy",
  },
];

const Footer = () => {
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ----- Left section ----- */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="logo" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quisquam, quos.
          </p>
        </div>

        {/* ----- Center section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            {quickLinks01.map((link, index) => (
              <li key={index} className="">
                <Link to={link.path} onClick={handleLinkClick} className="">
                  {link.display}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ----- Right section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <div className="flex items-center gap-2 mb-4">
            <AiOutlinePhone className="text-gray-600 text-lg" />
            <span className="text-gray-600 font-medium text-lg">
              +1 (123) 456-7890
            </span>
          </div>
          <ul className="flex gap-2.5 ">
            {socialLinks.map((link, index) => (
              <Link
                to={link.path}
                key={index}
                onClick={handleLinkClick}
                className="w-9 h-9 border border-solid border-[#181A1E] rounded-full flex items-center 
                  justify-center group hover:bg-primary hover:border-none transition-all duration-300 "
              >
                {link.icon}
              </Link>
            ))}
          </ul>
        </div>
      </div>

      {/* ----- Copyright ----- */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center ">
          Copyright © 2024 developed by <span>Musgra</span>. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
