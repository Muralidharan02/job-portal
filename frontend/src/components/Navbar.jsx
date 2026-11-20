import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { offlineMode } from "../api";
import React from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">JobNest<span>.</span></Link>
      <nav>
        <Link to="/">Find Jobs</Link>
        {user?.role === "jobseeker" && <Link to="/my-applications">My Applications</Link>}
        {user?.role === "employer" && <><Link to="/post-job">Post a Job</Link><Link to="/received">Applications</Link></>}
        {offlineMode && user?.role === "admin" && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="nav-actions">
        {user ? <><span className="welcome">Hi, {user.name}</span><button className="btn btn-outline small" onClick={handleLogout}>Logout</button></>
          : <><Link to="/login" className="login-link">Login</Link><Link to="/register" className="btn small">Get Started</Link></>}
      </div>
    </header>
  );
}
