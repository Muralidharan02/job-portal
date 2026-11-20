
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { offlineMode } from "../api";

export default function Auth({ mode }) {
  const isRegister = mode === "register";

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (isRegister) {
        const data = await register(form);
        navigate(data.user.role === "admin" ? "/admin" : "/login");
      } else {
        await login(form.email, form.password);
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">
          {isRegister ? "JOIN JOBNEST" : "WELCOME BACK"}
        </span>

        <h1>
          {isRegister
            ? "Create your account"
            : "Login to your account"}
        </h1>

        <p>
          {isRegister
            ? "Start exploring your next opportunity."
            : "Continue your career journey."}
        </p>

        {isRegister && (
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={update}
              required
              placeholder="Enter your full name"
            />
          </label>
        )}

        <label>
          Email Address
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            required
            minLength={6}
            placeholder="Enter your password"
          />
        </label>

        {isRegister && (
          <label>
            Register As
            <select
              name="role"
              value={form.role}
              onChange={update}
            >
              <option value="jobseeker">Job Seeker</option>
              <option value="employer">Employer / Recruiter</option>
              {offlineMode && <option value="admin">Admin (offline demo only)</option>}
            </select>
          </label>
        )}
        {isRegister && offlineMode && form.role === "admin" && (
          <p className="muted">Demo-only admin access. Do not use this role for production.</p>
        )}

        {error && <p className="error">{error}</p>}

        <button
          type="submit"
          className="btn full"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : isRegister
            ? "Create Account"
            : "Login"}
        </button>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to JobNest?"}{" "}

          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Create account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
