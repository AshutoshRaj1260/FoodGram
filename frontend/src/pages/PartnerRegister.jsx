import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function PartnerRegister() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const apiUrl = import.meta.env.VITE_API_URL;

    e.preventDefault();
    const businessName = e.target.businessName.value;
    const owner = e.target.owner.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post(
      `${apiUrl}/api/auth/foodpartner/register`,
      {
        businessName: businessName,
        ownerName: owner,
        phone: phone,
        address: address,
        email: email,
        password: password,
      },
      {
        withCredentials: true,
      }
    );

    console.log(response.data);
    navigate("/create-food");
  };

  return (
    <div className="auth-wrap">
      <div style={{ paddingBottom:'3rem', fontSize:'4rem' }} className="brand-header">
        FoodGram
      </div>
      <main className="card" role="main">
        <section className="hero">
          <div className="logo" aria-hidden="true" />
          <h2>Join as a partner</h2>
          <p>Register your kitchen to receive orders and grow your business.</p>
        </section>

        <section className="form-pane">
          <div className="container">
            <div className="brand">
              <h1>Food Partner Sign up</h1>
              <p>Register your kitchen and start receiving orders.</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input">
                <label htmlFor="businessName">Business name</label>
                <input
                  id="businessName"
                  name="businessName"
                  placeholder="Tasty Bites"
                />
              </div>

              <div className="input">
                <label htmlFor="owner">Owner name</label>
                <input id="owner" name="owner" placeholder="Owner name" />
              </div>

              <div className="input">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 555 555 5555"
                />
              </div>

              <div className="input">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Street, City, State, ZIP"
                  rows={3}
                />
              </div>

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
                  placeholder="Create a password"
                />
              </div>

              <div className="or-row">Or continue with email</div>

              <div className="actions">
                <button className="btn" type="submit">
                  Create account
                </button>
                <Link className="switch-link" to="/foodpartner/login">
                  Have an account?
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      <div style={{margin:'1.8rem'}}>
        <Link className="switch-link" to="/user/register">
          Are you a user? Register here.
        </Link>
      </div>
    </div>
  );
}
