import React from 'react';
import '../styles/auth.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PartnerLogin() {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post('http://localhost:3000/api/auth/foodpartner/login', {
      email: email,
      password: password
    },{
      withCredentials: true
    })

    console.log(response.data);
    navigate('/create-food');

  };


  return (
    <div className="auth-wrap">
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
                <input id="email" name="email" type="email" placeholder="contact@business.com" />
              </div>

              <div className="input">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Your password" />
              </div>

              <div className="or-row">Or continue with email</div>

              <div className="actions">
                <button className="btn" type="submit">Sign in</button>
                <a className="switch-link" href="/foodpartner/register">Need an account?</a>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
