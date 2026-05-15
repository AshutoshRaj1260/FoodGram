import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "../styles/navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">FoodGram</span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu">
          <button onClick={() => scrollToSection("about")} className="nav-link">
            About
          </button>
          <button onClick={() => scrollToSection("features")} className="nav-link">
            Features
          </button>
          <button onClick={() => scrollToSection("partners")} className="nav-link">
            Partners
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="nav-auth">
          <ThemeToggle />
          <button
            onClick={() => handleNavigation("/user/login")}
            className="btn-login"
          >
            Login
          </button>
          <button
            onClick={() => handleNavigation("/user/register")}
            className="btn-signup"
          >
            Sign Up
          </button>
        </div>

        {/* Hamburger Menu */}
        <div className="hamburger" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <button onClick={() => scrollToSection("about")} className="mobile-nav-link">
            About
          </button>
          <button onClick={() => scrollToSection("features")} className="mobile-nav-link">
            Features
          </button>
          <button onClick={() => scrollToSection("partners")} className="mobile-nav-link">
            Partners
          </button>
          <button
            onClick={() => handleNavigation("/user/login")}
            className="mobile-nav-link mobile-login"
          >
            Login
          </button>
          <button
            onClick={() => handleNavigation("/user/register")}
            className="mobile-nav-link mobile-signup"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
