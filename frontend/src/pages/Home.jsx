import React from "react";
import Header from "../components/Header";
import SpecialtyMenu from "../components/SpecialtyMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import Guide from "./Guide";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialtyMenu />
      <TopDoctors />
      <Guide />
      <Banner />
    </div>
  );
};

export default Home;
