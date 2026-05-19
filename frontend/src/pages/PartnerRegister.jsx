import React, { useMemo, useState } from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import BrandLogo from "/brandLogo.png";
import PersonOutlineIcon from "@mui/icons-material/Person";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import {
  hasErrors,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
} from "../utils/validation";

export default function PartnerRegister({ onFlash }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    ownername: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(
    () => ({
      businessName: validateRequired(formData.businessName, "Business name"),
      ownername: validateRequired(formData.ownername, "Owner name"),
      phone: validatePhone(formData.phone),
      address: validateRequired(formData.address, "Address"),
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

    if (e.target.value === "user") {
      navigate("/user/register");
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
        `/api/auth/foodpartner/register`,
        {
          businessName: formData.businessName.trim(),
          ownerName: formData.ownername.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);
      navigate("/create-food");
    } catch (err) {
      onFlash?.(
        err.response?.data?.message || "Unable to create your partner account. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <div className="auth-wrap">
    //   <div
    //     style={{ paddingBottom: "1rem", fontSize: "4rem" }}
    //     className="brand-header"
    //   >
    //     <div className="brand-logo">
    //       <img src="/brandLogo.png" alt="" />
    //     </div>
    //     FoodGram
    //   </div>
    //   <main className="card" role="main">
    //     <section className="hero">
    //       <div className="logo" aria-hidden="true" />
    //       <h2>Join as a partner</h2>
    //       <p>Register your kitchen to receive orders and grow your business.</p>
    //     </section>

    //     <section className="form-pane">
    //       <div className="container">
    //         <div className="brand">
    //           <h1>Food Partner Sign up</h1>
    //           <p>Register your kitchen and start receiving orders.</p>
    //         </div>

    //         <form className="form" onSubmit={handleSubmit}>
    //           <div className="input">
    //             <label htmlFor="businessName">Business name</label>
    //             <input
    //               id="businessName"
    //               name="businessName"
    //               placeholder="Tasty Bites"
    //             />
    //           </div>

    //           <div className="input">
    //             <label htmlFor="owner">Owner name</label>
    //             <input id="owner" name="owner" placeholder="Owner name" />
    //           </div>

    //           <div className="input">
    //             <label htmlFor="phone">Phone number</label>
    //             <input
    //               id="phone"
    //               name="phone"
    //               type="tel"
    //               placeholder="+1 555 555 5555"
    //             />
    //           </div>

    //           <div className="input">
    //             <label htmlFor="address">Address</label>
    //             <textarea
    //               id="address"
    //               name="address"
    //               placeholder="Street, City, State, ZIP"
    //               rows={3}
    //             />
    //           </div>

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
    //               placeholder="Create a password"
    //             />
    //           </div>

    //           <div className="or-row">Or continue with email</div>

    //           <div className="actions">
    //             <button className="btn" type="submit">
    //               Create account
    //             </button>
    //             <Link className="switch-link" to="/foodpartner/login">
    //               Have an account?
    //             </Link>
    //           </div>
    //         </form>
    //       </div>
    //     </section>
    //   </main>

    //   <div style={{ margin: "1.8rem" }}>
    //     <Link className="switch-link" to="/user/register">
    //       Are you a user? Register here.
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
                  <option value="foodpartner">Food Partner</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>

            <h2 className="auth-title">
              Create Account <span className="stars">✨</span>
            </h2>
            <p className="auth-subtitle">
              Bring your flavors to the Foodgram community
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="inputBoxesWrapper">
                {/* old Wrapper above */}
                <div className="auth-field">
                  <label htmlFor="businessname">Business name</label>
                  <div className={`auth-input-wrapper ${shouldShowError("businessName") ? "invalid" : ""}`}>
                    <StorefrontOutlinedIcon className="auth-input-icon" />
                    <input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Burger Kings"
                      aria-label="Business name"
                      aria-invalid={shouldShowError("businessName")}
                      aria-describedby="businessName-error"
                    />
                  </div>
                  {shouldShowError("businessName") && (
                    <p className="field-error" id="businessName-error">{errors.businessName}</p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="ownername">Owner name</label>
                  <div className={`auth-input-wrapper ${shouldShowError("ownername") ? "invalid" : ""}`}>
                    <PersonOutlinedIcon className="auth-input-icon" />
                    <input
                      id="ownername"
                      name="ownername"
                      value={formData.ownername}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Jane Doe"
                      aria-label="Owner name"
                      aria-invalid={shouldShowError("ownername")}
                      aria-describedby="ownername-error"
                    />
                  </div>
                  {shouldShowError("ownername") && (
                    <p className="field-error" id="ownername-error">{errors.ownername}</p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="phone">Phone number</label>
                  <div className={`auth-input-wrapper ${shouldShowError("phone") ? "invalid" : ""}`}>
                    <LocalPhoneOutlinedIcon className="auth-input-icon" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+91 55555 55555"
                      aria-label="Phone number"
                      aria-invalid={shouldShowError("phone")}
                      aria-describedby="phone-error"
                    />
                  </div>
                  {shouldShowError("phone") && (
                    <p className="field-error" id="phone-error">{errors.phone}</p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="address">Address</label>
                  <div className={`auth-input-wrapper ${shouldShowError("address") ? "invalid" : ""}`}>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                      aria-label="address"
                      aria-invalid={shouldShowError("address")}
                      aria-describedby="address-error"
                    ></textarea>
                  </div>
                  {shouldShowError("address") && (
                    <p className="field-error" id="address-error">{errors.address}</p>
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
