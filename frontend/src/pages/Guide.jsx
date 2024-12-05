import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Guide = () => {
  const navigate = useNavigate();
  const articles = [
    { id: 1, title: "Musculoskeletal", image: assets.Musculoskeletal },
    { id: 2, title: "Nerve System", image: assets.Nerve },
    { id: 3, title: "Digestive System", image: assets.Digestive },
    { id: 4, title: "Dermatology", image: assets.Dermatology },
    { id: 5, title: "ENT", image: assets.ENT },
  ];

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800">
      <h1 className="text-3xl font-medium">Handbook</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Read the handbooks to learn more about the diseases.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-x-scroll custom-scrollbar">
        {articles.map((article) => (
          <div key={article.id} className="article-card">
            <img src={article.image} alt={article.title} className="w-full" />
            <p className="text-center mt-2">{article.title}</p>
          </div>
        ))}
      </div>
      <button className="bg-primary text-white px-12 py-3 rounded-full mt-10">
        See more
      </button>
    </div>
  );
};

export default Guide;
