import React, { useEffect, useState } from "react";
import api from "../api";

const applicationStatuses = ["Submitted", "Reviewing", "Shortlisted", "Rejected"];

export default function Admin() {
  const [dashboard, setDashboard] = useState({
    users: [],
    jobs: [],
    applications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(({ data }) => setDashboard(data))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message || "Could not load admin data."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteJob(job) {
    if (!window.confirm(`Delete "${job.title}" and its applications?`)) return;

    setError("");
    try {
      await api.delete(`/admin/jobs/${job._id}`);
      setDashboard((current) => ({
        ...current,
        jobs: current.jobs.filter((entry) => entry._id !== job._id),
        applications: current.applications.filter(
          (entry) => entry.job?._id !== job._id
        ),
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete the job."
      );
    }
  }

  async function updateApplicationStatus(applicationId, status) {
    setError("");
    try {
      const { data } = await api.patch(
        `/admin/applications/${applicationId}`,
        { status }
      );
      setDashboard((current) => ({
        ...current,
        applications: current.applications.map((application) =>
          application._id === applicationId
            ? { ...application, status: data.status }
            : application
        ),
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update the application."
      );
    }
  }

  return (
    <main className="section admin-page">
      <span className="eyebrow">OFFLINE DEMO ADMIN</span>
      <h1>Admin dashboard</h1>
      <p className="admin-intro">
        Review users, job listings, and applications in this browser.
      </p>

      {error && <p className="error" role="alert">{error}</p>}
      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <>
          <div className="admin-stats">
            <article className="admin-stat">
              <span>Users</span>
              <strong>{dashboard.users.length}</strong>
            </article>
            <article className="admin-stat">
              <span>Job listings</span>
              <strong>{dashboard.jobs.length}</strong>
            </article>
            <article className="admin-stat">
              <span>Applications</span>
              <strong>{dashboard.applications.length}</strong>
            </article>
          </div>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Job listings</h2>
              <span>{dashboard.jobs.length} total</span>
            </div>
            {dashboard.jobs.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.jobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title}</td>
                        <td>{job.company}</td>
                        <td>{job.location}</td>
                        <td>
                          <button
                            className="btn btn-outline small admin-delete"
                            onClick={() => deleteJob(job)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">No job listings yet.</div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Applications</h2>
              <span>{dashboard.applications.length} total</span>
            </div>
            {dashboard.applications.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Job</th>
                      <th>Message</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{application.applicant.name}</strong>
                          <small>{application.applicant.email}</small>
                        </td>
                        <td>
                          {application.job?.title || "Job unavailable"}
                          {application.job?.company && (
                            <small>{application.job.company}</small>
                          )}
                        </td>
                        <td>{application.message || "—"}</td>
                        <td>
                          <select
                            aria-label={`Status for ${application.applicant.name}`}
                            value={application.status}
                            onChange={(event) =>
                              updateApplicationStatus(
                                application._id,
                                event.target.value
                              )
                            }
                          >
                            {applicationStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">No applications received yet.</div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Users</h2>
              <span>{dashboard.users.length} total</span>
            </div>
            {dashboard.users.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">No users yet.</div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
