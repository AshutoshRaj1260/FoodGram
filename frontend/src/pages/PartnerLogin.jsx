import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function PartnerLogin() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;

    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post(
      `${apiUrl}/api/auth/foodpartner/login`,
      {
        email: email,
        password: password,
      },
      {
        withCredentials: true,
      }
    );

    console.log(response.data);
    localStorage.setItem("userType", "partner");
    console.log(localStorage.getItem("userType"));
    navigate("/create-food");
  };

  return (
    <div className="auth-wrap">
      <div className="brand-header">
        <div className="brand-logo">
          <img
            src="/brandLogo.png"
            alt=""
          />
        </div>
        FoodGram
      </div>
      <main className="card" role="main">
        <section className="hero">
          <div className="logo" aria-hidden="true" />
          <h2>Partner sign in</h2>
          <p>Access your dashboard to manage orders and menu.</p>
        </section>

        <section className="form-pane">
          <div className="container">
            <div className="brand">
              <h1>Food Partner Login</h1>
              <p>Sign in to manage orders and menu.</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@business.com"
                />
              </div>

              <div className="input">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                />
              </div>

              <div className="or-row">Or continue with email</div>

              <div className="actions">
                <button className="btn" type="submit">
                  Sign in
                </button>
                <Link className="switch-link" to="/foodpartner/register">
                  Need an account?
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
      <div>
        <Link className="switch-link" to="/">
          Are you a user? Sign in here.
        </Link>
      </div>
    </div>
  );
}
