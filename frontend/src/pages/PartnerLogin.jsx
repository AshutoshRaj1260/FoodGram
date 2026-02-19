import React from "react";
import { useState, useEffect } from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "user") {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setErrorMessage("");

    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/foodpartner/login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        },
      );

      console.log(response.data);
      localStorage.setItem("userType", "partner");
      console.log(localStorage.getItem("userType"));
      navigate("/create-food");
    } catch (err) {
      console.log(err.response.data.message);
      setErrorMessage(err.response.data.message);
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
      <div className="authPage">
        <div className="form-container">
          <div className="form-left">
            <img
              className="form-image"
              src={backgroundImage}
              alt="Background"
            />
          </div>
          <div className="form-right">
            <div className="top">
              <h2>FOODGRAM</h2>
              <select
                onChange={(e) => {
                  handleUserChange(e);
                }}
              >
                <option value="foodpartner">Food Partner</option>
                <option value="user">User</option>
              </select>
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

            <section className="formPane">
              <div className="form-header">
                <h2>Partner login</h2>
                <p>Sign in to manage orders and menu.</p>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="inputBox">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@business.com"
                  />
                </div>

                <div className="inputBox">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Your password"
                  />
                </div>

                {/* <div className="or-row">Or continue with email</div> */}

                <div className="actions">
                  <button className="btn" type="submit">
                    Login
                  </button>
                  <Link className="switch-link" to="/foodpartner/register">
                    Need an account?
                  </Link>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
