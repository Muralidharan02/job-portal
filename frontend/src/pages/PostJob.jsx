import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", company: "", location: "", type: "Full-time", salary: "", description: "", skills: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api.post("/jobs", { ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not post job.");
    } finally { setBusy(false); }
  }

  return <main className="auth-wrap"><form className="auth-card wide" onSubmit={submit}>
    <span className="eyebrow">EMPLOYER SPACE</span><h1>Post a new job</h1><p>Share an opportunity with candidates.</p>
    <label>Job title<input name="title" value={form.title} onChange={update} required placeholder="e.g. Frontend Developer" /></label>
    <label>Company name<input name="company" value={form.company} onChange={update} required /></label>
    <label>Location<input name="location" value={form.location} onChange={update} required placeholder="e.g. Coimbatore / Remote" /></label>
    <label>Job type<select name="type" value={form.type} onChange={update}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select></label>
    <label>Salary<input name="salary" value={form.salary} onChange={update} placeholder="e.g. ₹3–5 LPA" /></label>
    <label>Skills (comma separated)<input name="skills" value={form.skills} onChange={update} placeholder="React, JavaScript, CSS" /></label>
    <label>Job description<textarea name="description" value={form.description} onChange={update} required rows="6" /></label>
    {error && <p className="error">{error}</p>}<button className="btn full" disabled={busy}>{busy ? "Publishing..." : "Publish Job"}</button>
  </form></main>;
}
