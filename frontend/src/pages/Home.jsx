import { useEffect, useState } from "react";
import api from "../api";
import JobCard from "../components/JobCard";
import React from "react";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs(term = "") {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/jobs${term ? `?search=${encodeURIComponent(term)}` : ""}`);
      setJobs(data);
    } catch {
      setError("Could not load jobs. Please check that the backend is running.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadJobs(); }, []);

  function submitSearch(e) {
    e.preventDefault();
    loadJobs(search);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Find a job that<br /><span>moves you forward.</span></h1>
          <p>Explore opportunities, connect with employers and take the next step in your career.</p>
          <form className="search-bar" onSubmit={submitSearch}>
            <span>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title, company or location" />
            <button className="btn" type="submit">Search Jobs</button>
          </form>
          <small>Discover opportunities that match your ambition.</small>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle"><div className="art-card"><span className="art-icon">✦</span><b>Your future</b><small>is one click away</small><div className="art-lines"></div><div className="art-pill"></div></div></div>
          <span className="float float-one">✧</span><span className="float float-two">↗</span>
        </div>
      </section>
      <main className="section">
        <div className="section-heading"><div><span className="eyebrow">OPPORTUNITIES</span><h2>Latest job openings</h2><p>Find a role where you can do your best work.</p></div><span className="count">{jobs.length} jobs found</span></div>
        {loading ? <p>Loading jobs...</p> : error ? <p className="error">{error}</p> : jobs.length ? <div className="job-grid">{jobs.map(job => <JobCard key={job._id} job={job} />)}</div> : <div className="empty">No jobs found. Try another search.</div>}
      </main>
      <footer>© {new Date().getFullYear()} JobNest. Built with the MERN stack.</footer>
    </>
  );
}
