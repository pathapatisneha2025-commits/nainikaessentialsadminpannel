import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuMail, LuLock, LuEye, LuEyeOff, LuX } from "react-icons/lu";

const BASE_URL = "https://medicurehospitaldatabase.onrender.com";

export default function AdminLogin() {
  const navigate = useNavigate();

  // Login state
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");
        navigate("/admin/products");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/admin/reset-passwordd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) throw new Error("Reset failed");

      setResetSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send reset link");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ELANCOTT</h1>
        <p className="subtitle">Admin Login</p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <LuMail />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <LuLock />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <LuEyeOff /> : <LuEye />}
            </button>
          </div>

          <div className="forgot-row">
           <button
  type="button"
  className="forgot-btn"
  onClick={() => navigate("/forgotpassword")}
>
  Forgot password?
</button>

          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="footer-text">© {new Date().getFullYear()} Elancott</p>
      </div>

      {/* RESET PASSWORD MODAL */}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowReset(false)}>
              <LuX />
            </button>

            <h2>Reset Password</h2>
            <p className="modal-text">
              Enter your email to receive a reset link
            </p>

            {resetSent ? (
              <p className="success-text">
                ✅ Reset link sent to your email
              </p>
            ) : (
              <form onSubmit={handleReset}>
                <div className="input-box">
                  <LuMail />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button className="login-btn">Send Reset Link</button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0B5ED7, #084298);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          background: white;
          max-width: 420px;
          width: 100%;
          padding: 40px;
          border-radius: 26px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.2);
          text-align: center;
        }

        h1 {
          color: #0B5ED7;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .subtitle {
          color: #64748B;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #F1F5FF;
          border: 1px solid #DDE7FF;
        }

        .input-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
        }

        .eye-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .forgot-row {
          text-align: right;
        }

        .forgot-btn {
          background: none;
          border: none;
          color: #0B5ED7;
          font-size: 13px;
          cursor: pointer;
        }

        .login-btn {
          background: linear-gradient(135deg, #0B5ED7, #084298);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .footer-text {
          margin-top: 24px;
          font-size: 12px;
          color: #94A3B8;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 30px;
          width: 90%;
          max-width: 380px;
          border-radius: 22px;
          position: relative;
          text-align: center;
        }

        .close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
        }

        .modal-text {
          color: #64748B;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .success-text {
          color: green;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
