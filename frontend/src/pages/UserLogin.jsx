import React from "react";
import { useState, useEffect } from "react";
import "../styles/auth.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/Person";
import BrandLogo from "../../public/brandLogo.png";

export default function UserLogin() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  const handleUserChange = (e) => {
    if (e.target.value === "foodpartner") {
      navigate("/foodpartner/login");
    }
  };

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setErrorMessage("");
    setSuccessMessage("");
    setIsUnverified(false);
    setIsLoading(true);
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    setTempEmail(email);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/user/login`,
        { email, password },
        { withCredentials: true },
      );
      localStorage.setItem("userType", "user");
      setSuccessMessage(response.data.message || "Logged in successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Login failed. Please try again.");
      if (err.response?.status === 403) {
        setIsUnverified(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    // <div className="auth-wrap">
    //   <div className="brand-header">
    //     <div className="brand-logo">
    //       <img
    //         src="/brandLogo.png"
    //         alt=""
    //       />
    //     </div>
    //     FoodGram
    //   </div>

    //   <main className="card" role="main">
    //     <section className="hero">
    //       <div className="logo" aria-hidden="true" />
    //       <h2>Welcome back</h2>
    //       <p>Sign in to continue ordering your favorite meals.</p>
    //     </section>

    //     <section className="form-pane">
    //       <div className="container">
    //         <div className="brand">
    //           <h1>User Login</h1>
    //           <p>Welcome back — sign in to continue.</p>
    //         </div>

    //         <form className="form" onSubmit={handleSubmit}>
    //           <div className="input">
    //             <label htmlFor="email">Email</label>
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               placeholder="you@example.com"
    //             />
    //           </div>

    //           <div className="input">
    //             <label htmlFor="password">Password</label>
    //             <input
    //               id="password"
    //               name="password"
    //               type="password"
    //               placeholder="Your password"
    //             />
    //           </div>

    //           <div className="or-row">Or continue with email</div>

    //           <div className="actions">
    //             <button className="btn" type="submit">
    //               Sign in
    //             </button>
    //             <Link className="switch-link" to="/user/register">
    //               Need an account?
    //             </Link>
    //           </div>
    //         </form>
    //       </div>
    //     </section>
    //   </main>

    //   <div>
    //     <Link className="switch-link" to="/foodpartner/login">
    //       Are you a food partner? Sign in here.
    //     </Link>
    //   </div>
    // </div>
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
                {" "}
                <img src={BrandLogo} alt="logo" className="auto-logo-image" />
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
                  <h5>{errorMessage}</h5>
                  {isUnverified ? (
                    <Link 
                      to="/verify-email" 
                      state={{ email: tempEmail, role: "user" }}
                      style={{ color: "#c0392b", fontSize: "0.75rem", fontWeight: "700", textDecoration: "underline" }}
                    >
                      Verify Now
                    </Link>
                  ) : (
                    <p>Please try again</p>
                  )}
                </div>
                <div className="errorLine"></div>
              </div>
            )}

            {successMessage && (
              <div className="successBanner">
                <h5>✅ {successMessage}</h5>
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
                    type="password"
                    placeholder="your password"
                    aria-label="Password"
                    required
                  />
                </div>
              </div>
              <button className="auth-btn" type="submit" disabled={isLoading}>
                {isLoading ? <span className="btn-spinner" /> : "Login"}
              </button>
              <button type="button" className="auth-btn"
              onClick={() => {
                  window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
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
