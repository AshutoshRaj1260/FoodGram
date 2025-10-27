import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/reels.css";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import AddBoxIcon from '@mui/icons-material/AddBox';

const BottomNavBar = ({ userType }) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogout = async () => {
    try {
      const logoutEndpoint =
        userType === "partner"
          ? `${apiUrl}/api/auth/foodpartner/logout`
          : `${apiUrl}/api/auth/user/logout`;

      await axios.get(logoutEndpoint, { withCredentials: true });

      // Redirect to the correct login page
      navigate(userType === "partner" ? "/foodpartner/login" : "/");
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <div className="nav-inner">
        <Link to={"/home"} className="nav-link">
          <HomeIcon />
          <span>Home</span>
        </Link>

        {userType === "user" && (
          <Link to="/saved" className="nav-link">
            <BookmarkIcon />
            <span>Saved</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="nav-link"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>

        {userType === "partner" && (
          <Link to="/create-food" className="nav-link">
            <AddBoxIcon />
            <span>Add food</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default BottomNavBar;
