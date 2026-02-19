import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";

export default function UserRegister() {
  const navigate = useNavigate();

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "foodpartner") {
      navigate("/foodpartner/register");
    }
  };

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
      },
    );

    console.log(response.data);
    navigate("/home");
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
                <option value="user">User</option>
                <option value="foodpartner">Food Partner</option>
              </select>
            </div>

            <section className="formPane">
              <div className="form-header">
                <h2>User Sign Up</h2>
                <p>Sign up to discover great meals in your area.</p>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="inputBox">
                  <label htmlFor="name">Full name</label>
                  <input id="name" name="name" placeholder="Jane Doe" />
                </div>
                <div className="inputBox">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
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
                    Create account
                  </button>
                  <Link className="switch-link" to="/">
                    Already have an account?
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
