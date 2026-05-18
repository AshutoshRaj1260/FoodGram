import React from "react";
import { useState, useEffect, useMemo } from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import BrandLogo from "/brandLogo.png";
import {
  hasErrors,
  validateEmail,
  validatePassword,
} from "../utils/validation";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(
    () => ({
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    }),
    [formData],
  );

  const isFormInvalid = hasErrors(errors);

  const shouldShowError = (field) => Boolean((touched[field] || submitAttempted) && errors[field]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    setTouched((current) => ({
      ...current,
      [e.target.name]: true,
    }));
  };

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "user") {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    setErrorMessage("");

    e.preventDefault();
    setSubmitAttempted(true);

    if (isFormInvalid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `/api/auth/foodpartner/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("userType", "partner");
      navigate("/create-food");
    } catch (err) {
      console.log(err.response?.data?.message);
      setErrorMessage(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setIsSubmitting(false);
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
    //       <h2>Partner sign in</h2>
    //       <p>Access your dashboard to manage orders and menu.</p>
    //     </section>

    //     <section className="form-pane">
    //       <div className="container">
    //         <div className="brand">
    //           <h1>Food Partner Login</h1>
    //           <p>Sign in to manage orders and menu.</p>
    //         </div>

    //         <form className="form" onSubmit={handleSubmit}>
    //           <div className="input">
    //             <label htmlFor="email">Email</label>
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               placeholder="contact@business.com"
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
    //             <Link className="switch-link" to="/foodpartner/register">
    //               Need an account?
    //             </Link>
    //           </div>
    //         </form>
    //       </div>
    //     </section>
    //   </main>
    //   <div>
    //     <Link className="switch-link" to="/">
    //       Are you a user? Sign in here.
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
                <DeliveryDiningIcon className="auth-select-icon" />
                <select
                  className="auth-role-select"
                  onChange={(e) => {
                    handleUserChange(e);
                  }}
                  aria-label="Login as"
                >
                  <option value="foodpartner">Food Partner</option>
                  <option value="user">User</option>
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
                  <p>Please try again</p>
                </div>
                <div className="errorLine"></div>
              </div>
            )}

            <h2 className="auth-title">
              Welcome Back<span className="wave-hand">👋</span>
            </h2>
            <p className="auth-subtitle">Sign in to manage orders and menu</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <div className={`auth-input-wrapper ${shouldShowError("email") ? "invalid" : ""}`}>
                  <MailOutlineIcon className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="contact@business.com"
                    aria-label="Email address"
                    aria-invalid={shouldShowError("email")}
                    aria-describedby="email-error"
                  />
                </div>
                {shouldShowError("email") && (
                  <p className="field-error" id="email-error">{errors.email}</p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className={`auth-input-wrapper ${shouldShowError("password") ? "invalid" : ""}`}>
                  <LockOutlinedIcon className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your password"
                    aria-label="Password"
                    aria-invalid={shouldShowError("password")}
                    aria-describedby="password-error"
                  />
                </div>
                {shouldShowError("password") && (
                  <p className="field-error" id="password-error">{errors.password}</p>
                )}
              </div>
              <button className="auth-btn" type="submit" disabled={isFormInvalid || isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
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
