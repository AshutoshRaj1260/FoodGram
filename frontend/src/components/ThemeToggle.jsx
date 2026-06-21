import React from "react";
import { useTheme } from "../hooks/useTheme";
import SunIcon from "@mui/icons-material/LightMode";
import MoonIcon from "@mui/icons-material/DarkMode";
import "../styles/theme-toggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;
