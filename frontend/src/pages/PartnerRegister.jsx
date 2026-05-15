import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import BrandLogo from "../../public/brandLogo.png";
import PersonOutlineIcon from "@mui/icons-material/Person";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

export default function PartnerRegister() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "user") {
      navigate("/user/register");
    }
  };

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const businessName = e.target.businessName.value;
    const owner = e.target.owner.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/foodpartner/register`,
        { businessName, ownerName: owner, phone, address, email, password },
        { withCredentials: true },
      );
      setSuccessMessage(response.data.message || "Account created! Please check your email.");
      setTimeout(() => navigate("/verify-email", { state: { email, role: "partner" } }), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
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
              Bring your flavors to the Foodgram community
            </p>

            <form onSubmit={handleSubmit}>
              <div className="inputBoxesWrapper">
                {/* old Wrapper above */}
                <div className="auth-field">
                  <label htmlFor="businessname">Business name</label>
                  <div className="auth-input-wrapper">
                    <StorefrontOutlinedIcon className="auth-input-icon" />
                    <input
                      id="businessName"
                      name="businessName"
                      placeholder="Burger Kings"
                      aria-label="Business name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="ownername">Owner name</label>
                  <div className="auth-input-wrapper">
                    <PersonOutlinedIcon className="auth-input-icon" />
                    <input
                      id="ownername"
                      name="owner"
                      placeholder="Jane Doe"
                      aria-label="Owner name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="phone">Phone number</label>
                  <div className="auth-input-wrapper">
                    <LocalPhoneOutlinedIcon className="auth-input-icon" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 55555 55555"
                      aria-label="Phone number"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="address">Address</label>
                  <div className="auth-input-wrapper">
                    <textarea
                      id="address"
                      name="address"
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                      aria-label="address"
                      required
                    ></textarea>
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
