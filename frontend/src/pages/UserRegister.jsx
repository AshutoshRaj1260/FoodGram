import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function UserRegister() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;

    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post(
      `${apiUrl}/api/auth/user/register`,
      {
        fullName: name,
        email: email,
        password: password,
      },
      {
        withCredentials: true,
      }
    );

    console.log(response.data);
    navigate("/home");
  };

  return (
    <div className="auth-wrap">
      <div className="brand-header">FoodGram</div>
      <main className="card" role="main">
        <section className="hero">
          <div className="logo" aria-hidden="true" />
          <h2>Welcome to Foodly</h2>
          <p>
            Sign up to discover great meals and quick delivery in your area.
          </p>
        </section>

        <section className="form-pane">
          <div className="container">
            <div className="brand">
              <h1>User Sign up</h1>
              <p>Create an account to order food quickly.</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" placeholder="Jane Doe" />
              </div>

              <div className="input">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="input">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="or-row">Or continue with email</div>

              <div className="actions">
                <button className="btn" type="submit">
                  Create account
                </button>
                <Link className="switch-link" to="/">
                  Already have an account?
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      <div>
        <Link className="switch-link" to="/foodpartner/register">
          Are you a food partner? Register here.
        </Link>
      </div>
    </div>
  );
}
