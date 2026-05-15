import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import BrandLogo from "../../public/brandLogo.png";
import backgroundImage from "../assets/backgroundImage.jpeg";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email + role are passed via navigate state from register pages
  const { email, role } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-clear error after 5s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only single digit

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      inputRefs.current[3]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = role === "partner"
        ? `${apiUrl}/api/auth/foodpartner/verify-email`
        : `${apiUrl}/api/auth/user/verify-email`;

      const response = await axios.post(endpoint, { email, otp: code }, { withCredentials: true });

      setSuccess(response.data.message || "Email verified! Redirecting to login...");
      setTimeout(() => {
        navigate(role === "partner" ? "/foodpartner/login" : "/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = role === "partner"
        ? `${apiUrl}/api/auth/foodpartner/resend-otp`
        : `${apiUrl}/api/auth/user/resend-otp`;

      const response = await axios.post(endpoint, { email }, { withCredentials: true });

      setSuccess(response.data.message || "A new OTP has been sent to your email.");
      setResendCooldown(60);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          {/* Left image panel */}
          <div className="auth-image-panel">
            <img src={backgroundImage} alt="Delicious food spread" />
            <div className="auth-image-overlay">
              <div className="auth-overlay-content">
                <span className="auth-badge">✨ Almost there!</span>
                <h1>Check your inbox</h1>
                <p>
                  We've sent a 4-digit code to
                  <br />
                  <strong>{email}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-header">
              <span className="auth-logo">
                <img src={BrandLogo} alt="logo" className="auto-logo-image" />
                <p className="auth-logo-text">FOODGRAM</p>
              </span>
            </div>

            {error && (
              <div className="errorBanner">
                <ReportGmailerrorredIcon sx={{ fontSize: "40px", color: "#e91938" }} />
                <div className="error">
                  <h5>{error}</h5>
                  <p>Please try again</p>
                </div>
                <div className="errorLine"></div>
              </div>
            )}

            {success && (
              <div className="successBanner">
                <h5>✅ {success}</h5>
              </div>
            )}

            <h2 className="auth-title">
              Verify Email <span className="stars">📬</span>
            </h2>
            <p className="auth-subtitle">
              Enter the 4-digit code sent to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerify}>
              <div className="otp-input-row" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`OTP digit ${i + 1}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : "Verify Email"}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: "1rem" }}>
              Didn't receive it?{" "}
              <button
                className="resend-btn"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
              >
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
