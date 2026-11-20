import React, { useEffect, useState } from "react";
import api from "../api";

export function MyApplications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/applications/mine").then(r => setItems(r.data)).catch(() => setError("Could not load applications.")); }, []);
  return <main className="section"><span className="eyebrow">JOB SEEKER</span><h1>My applications</h1>{error && <p className="error">{error}</p>}
    {items.length === 0 && !error ? <div className="empty">You have not applied to any jobs yet.</div> : <div className="table-list">{items.map(a => <div className="application-row" key={a._id}><div><b>{a.job?.title || "Job"}</b><p>{a.job?.company} · {a.job?.location}</p></div><span className="tag">{a.status}</span></div>)}</div>}
  </main>;
}

export function ReceivedApplications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/applications/received").then(r => setItems(r.data)).catch(() => setError("Could not load applications.")); }, []);
  return <main className="section"><span className="eyebrow">EMPLOYER SPACE</span><h1>Received applications</h1>{error && <p className="error">{error}</p>}
    {items.length === 0 && !error ? <div className="empty">No applications received yet.</div> : <div className="table-list">{items.map(a => <div className="application-row" key={a._id}><div><b>{a.applicant?.name}</b><p>{a.applicant?.email} · Applied for {a.job?.title}</p>{a.message && <p>{a.message}</p>}</div><span className="tag">{a.status}</span></div>)}</div>}
  </main>;
}
