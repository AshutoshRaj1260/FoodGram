import React, { useMemo, useState } from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/Person";
import BrandLogo from "/brandLogo.png";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import {
  hasErrors,
  validateEmail,
  validatePassword,
  validateRequired,
} from "../utils/validation";


export default function UserRegister({ onFlash }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(
    () => ({
      name: validateRequired(formData.name, "Full name"),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password, { strict: true }),
    }),
    [formData],
  );

  const isFormInvalid = hasErrors(errors);

  const shouldShowError = (field) => Boolean((touched[field] || submitAttempted) && errors[field]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    if (e.target.value === "foodpartner") {
      navigate("/foodpartner/register");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (isFormInvalid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `/api/auth/user/register`,
        {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);
      navigate("/home");
    } catch (err) {
      onFlash?.(
        err.response?.data?.message || "Unable to create your account. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
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

            <h2 className="auth-title">
              Create Account <span className="stars">✨</span>
            </h2>
            <p className="auth-subtitle">
              Join Foodgram and start exploring delicious moments
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="name">Full name</label>
                <div className={`auth-input-wrapper ${shouldShowError("name") ? "invalid" : ""}`}>
                  <PersonOutlinedIcon className="auth-input-icon" />
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Jane Doe"
                    aria-label="Full name"
                    aria-invalid={shouldShowError("name")}
                    aria-describedby="name-error"
                  />
                </div>
                {shouldShowError("name") && (
                  <p className="field-error" id="name-error">{errors.name}</p>
                )}
              </div>

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
                    placeholder="you@example.com"
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
                    maxLength={64}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your password"
                    aria-label="Password"
                    aria-invalid={shouldShowError("password")}
                    aria-describedby="password-error password-help"
                  />
                </div>
                {shouldShowError("password") && (
                  <p className="field-error" id="password-error">{errors.password}</p>
                )}
                <p className="psw_info">
                Must contain at least 8 characters with a number, uppercase letter, and special character.
              </p>
              </div>

              <button className="auth-btn" type="submit" disabled={isFormInvalid || isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
