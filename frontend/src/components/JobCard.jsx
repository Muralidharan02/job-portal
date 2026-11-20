import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="job-top">
        <div className="company-mark">{(job.company || "J").slice(0, 1).toUpperCase()}</div>
        <span className="tag">{job.type}</span>
      </div>
      <h3>{job.title}</h3>
      <p className="company">{job.company}</p>
      <div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.salary || "Salary not specified"}</span></div>
      <p className="job-description">{job.description}</p>
      <Link className="btn full" to={`/jobs/${job._id}`}>View Details</Link>
    </article>
  );
}
