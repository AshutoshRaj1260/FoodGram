import React from "react";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/backgroundImage.jpeg";

export default function PartnerRegister() {
  const navigate = useNavigate();

  const handleUserChange = (e) => {
    console.log(e.target.value);

    if (e.target.value === "user") {
      navigate("/user/register");
    }
  };

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
      },
    );

    console.log(response.data);
    navigate("/create-food");
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

            <section className="formPane">
              <div className="form-header">
                <h2>Join as a partner</h2>
                <p>
                  Register your kitchen to receive orders and grow your
                  business.
                </p>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="inputBoxesWrapper">
                  {" "}
                  <div className="inputBox">
                    <label htmlFor="businessname">Business name</label>
                    <input
                      id="businessName"
                      name="businessName"
                      placeholder="Burger Kings"
                    />
                  </div>
                  <div className="inputBox">
                    <label htmlFor="ownerName">Owner name</label>
                    <input
                      id="ownerName"
                      name="businessName"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="inputBox">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 55555 55555"
                    />
                  </div>
                  <div className="inputBox">
                    <label htmlFor="address">Address</label>
                    <textarea
                      name="address"
                      id="address"
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                    ></textarea>
                  </div>
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
                      placeholder="Create a password"
                    />
                  </div>
                </div>
                {/* <div className="or-row">Or continue with email</div> */}
                <div className="actions">
                  <button className="btn" type="submit">
                    Create account
                  </button>
                  <Link className="switch-link" to="/foodpartner/login">
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
