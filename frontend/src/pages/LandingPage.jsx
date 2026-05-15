import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import FeaturesSection from "../components/FeaturesSection";
import PartnersSection from "../components/PartnersSection";
import Footer from "../components/Footer";
import "../styles/landing-page.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PartnersSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
