import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const el = document.documentElement;
    if (theme === "dark") {
      el.classList.add("dark-theme");
      el.classList.remove("light-theme");
    } else {
      el.classList.add("light-theme");
      el.classList.remove("dark-theme");
    }
  }, [theme]);

  // Listen for changes in OS theme settings
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    
    const listener = (event) => {
      const saved = localStorage.getItem("theme");
      if (!saved) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    const updated = theme === "dark" ? "light" : "dark";
    setTheme(updated);
    localStorage.setItem("theme", updated);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
