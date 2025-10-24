import React from 'react';
import '../styles/auth.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserLogin() {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    const apiUrl = import.meta.env.VITE_API_URL;

    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post(`${apiUrl}/api/auth/user/login`, {
      email: email,
      password: password
    },{
      withCredentials: true
    })

    console.log(response.data);
    navigate('/');

  };


  return (
    <div className="auth-wrap">
      <main className="card" role="main">
        <section className="hero">
          <div className="logo" aria-hidden="true" />
          <h2>Welcome back</h2>
          <p>Sign in to continue ordering your favorite meals.</p>
        </section>

        <section className="form-pane">
          <div className="container">
            <div className="brand">
              <h1>User Login</h1>
              <p>Welcome back — sign in to continue.</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" />
              </div>

              <div className="input">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Your password" />
              </div>

              <div className="or-row">Or continue with email</div>

              <div className="actions">
                <button className="btn" type="submit">Sign in</button>
                <a className="switch-link" href="/user/register">Need an account?</a>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
