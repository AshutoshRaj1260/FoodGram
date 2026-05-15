import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/Person";
import BrandLogo from "../../public/brandLogo.png";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

export default function UserRegister() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUserChange = (e) => {
    if (e.target.value === "foodpartner") {
      navigate("/foodpartner/register");
    }
  };

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/user/register`,
        { fullName: name, email, password },
        { withCredentials: true },
      );
      setSuccessMessage(response.data.message || "Account created! Please check your email.");
      setTimeout(() => navigate("/verify-email", { state: { email, role: "user" } }), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="auth-wrap">
    //   <div className="brand-header">
    //     <div className="brand-logo">
    //       <img src="/brandLogo.png" alt="" />
    //     </div>
    //     FoodGram
    //   </div>
    //   <main className="card" role="main">
    //     <section className="hero">
    //       <div className="logo" aria-hidden="true" />
    //       <h2>Welcome to Foodly</h2>
    //       <p>
    //         Sign up to discover great meals and quick delivery in your area.
    //       </p>
    //     </section>

    //     <section className="form-pane">
    //       <div className="container">
    //         <div className="brand">
    //           <h1>User Sign up</h1>
    //           <p>Create an account to order food quickly.</p>
    //         </div>

    //         <form className="form" onSubmit={handleSubmit}>
    //           <div className="input">
    //             <label htmlFor="name">Full name</label>
    //             <input id="name" name="name" placeholder="Jane Doe" />
    //           </div>

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
    //               placeholder="At least 8 characters"
    //             />
    //           </div>

    //           <div className="or-row">Or continue with email</div>

    //           <div className="actions">
    //             <button className="btn" type="submit">
    //               Create account
    //             </button>
    //             <Link className="switch-link" to="/">
    //               Already have an account?
    //             </Link>
    //           </div>
    //         </form>
    //       </div>
    //     </section>
    //   </main>

    //   <div>
    //     <Link className="switch-link" to="/foodpartner/register">
    //       Are you a food partner? Register here.
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
                  aria-label="Signup as"
                >
                  <option value="user">User</option>
                  <option value="foodpartner">Food Partner</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="errorBanner">
                <ReportGmailerrorredIcon sx={{ fontSize: "40px", color: "#e91938" }} />
                <div className="error">
                  <h5>{errorMessage}</h5>
                  <p>Please try again</p>
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
              Create Account <span className="stars">✨</span>
            </h2>
            <p className="auth-subtitle">
              Join Foodgram and start exploring delicious moments
            </p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="name">Full name</label>
                <div className="auth-input-wrapper">
                  <PersonOutlinedIcon className="auth-input-icon" />
                  <input
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    aria-label="Full name"
                    required
                  />
                </div>
              </div>

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
                {isLoading ? <span className="btn-spinner" /> : "Create account"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <a href="/">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
