import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/Person";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import "../styles/auth.css";
import BrandLogo from "/brandLogo.png";

export default function UserLogin() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "foodpartner") {
      navigate("/foodpartner/login");
    }
  };

  const handleSubmit = async (e) => {
    setErrorMessage("");

    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await axios.post(
        `/api/auth/user/login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("userType", "user");
      navigate("/home");
    } catch (err) {
      console.log(err.response?.data?.message);

      setErrorMessage(
        err.response?.data?.message || "Invalid Credentials"
      );
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          {/* Left image panel */}
          <div className="auth-image-panel">
            <img src={backgroundImage} alt="Delicious food spread" />

            <div className="auth-image-overlay">
              <div className="auth-overlay-content">
                <span className="auth-badge">✨ Premium Experience</span>

                <h1>Made for Food Lovers</h1>

                <p>
                  Good coffee, good food, great moments.
                  <br />
                  Let’s continue your journey!
                </p>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-header">
              <span className="auth-logo">
                <img
                  src={BrandLogo}
                  alt="logo"
                  className="auto-logo-image"
                />

                <p className="auth-logo-text">FOODGRAM</p>
              </span>

              <div className="auth-select-wrapper">
                <PersonOutlineIcon className="auth-select-icon" />

                <select
                  className="auth-role-select"
                  onChange={(e) => {
                    handleUserChange(e);
                  }}
                  aria-label="Login as"
                >
                  <option value="user">User</option>
                  <option value="foodpartner">Food Partner</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="errorBanner">
                <ReportGmailerrorredIcon
                  sx={{ fontSize: "40px", color: "#e91938" }}
                />

                <div className="error">
                  <h5 style={{ color: "#8b0000" }}>{errorMessage}</h5>

                  <p style={{ color: "#5f2120", fontWeight: "500" }}>
                    Please try again
                  </p>
                </div>

                <div className="errorLine"></div>
              </div>
            )}

            <h2 className="auth-title">
              Welcome Back<span className="wave-hand">👋</span>
            </h2>

            <p className="auth-subtitle">
              Sign in to continue enjoying Foodgram
            </p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">Email</label>

                <div className="auth-input-wrapper">
                  <MailOutlineIcon className="auth-input-icon" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <div className="auth-input-wrapper">
                  <LockOutlinedIcon className="auth-input-icon" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="your password"
                    aria-label="Password"
                    required
                  />

                  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
  style={{
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#666",
  }}
>
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </button>
                </div>
              </div>

              <button className="auth-btn" type="submit">
                Login
              </button>

              <button
                type="button"
                className="auth-btn"
                onClick={() => {
                  window.location.href =
                    import.meta.env.VITE_GOOGLE_AUTH_URL;
                }}
              >
                Continue with Google
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account? <a href="/user/register">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}