import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data))
      .catch(() => setError("Job not found."));
  }, [id]);

  async function apply(e) {
    e.preventDefault();
    setNotice(""); setError("");
    try {
      await api.post(`/applications/${id}`, { message });
      setNotice("Your application has been submitted!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not apply.");
    }
  }

  if (error && !job) return <main className="section"><p className="error">{error}</p><Link to="/">Back to jobs</Link></main>;
  if (!job) return <main className="section">Loading job...</main>;

  return (
    <main className="section detail-layout">
      <div className="detail-main">
        <Link to="/" className="back-link">← Back to jobs</Link>
        <span className="tag">{job.type}</span>
        <h1>{job.title}</h1>
        <p className="company">{job.company} · {job.location}</p>
        <hr />
        <h2>Job description</h2><p className="long-copy">{job.description}</p>
        <h2>Required skills</h2>
        <div className="skills">{(job.skills || []).map((s, i) => <span className="tag" key={i}>{s}</span>)}</div>
      </div>
      <aside className="apply-card">
        <h3>Job overview</h3><p><b>Company</b><br />{job.company}</p><p><b>Location</b><br />{job.location}</p><p><b>Salary</b><br />{job.salary || "Not specified"}</p>
        {user?.role === "jobseeker" ? <form onSubmit={apply}><label>Message to employer<textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Briefly introduce yourself (optional)" rows="4" /></label><button className="btn full">Apply Now</button></form>
          : !user ? <Link className="btn full" to="/login">Login to apply</Link>
          : <p className="muted">Employer accounts cannot apply for jobs.</p>}
        {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
      </aside>
    </main>
  );
}
