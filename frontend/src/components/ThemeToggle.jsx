import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/theme-toggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="toggle-slider">
        {theme === 'light' ? (
          <Moon size={18} />
        ) : (
          <Sun size={18} />
        )}
      </span>
      <span className="toggle-icon-bg light-icon">
        <Sun size={16} />
      </span>
      <span className="toggle-icon-bg dark-icon">
        <Moon size={16} />
      </span>
    </button>
  );
}
