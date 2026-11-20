const storageKeys = {
  jobs: "jobnest:jobs",
  users: "jobnest:users",
  applications: "jobnest:applications",
  tokens: "jobnest:tokens",
  deletedSampleJobs: "jobnest:deletedSampleJobs",
};

const sampleJobs = [
  {
    _id: "sample-job-1",
    title: "Frontend Developer",
    company: "BrightLabs",
    location: "Remote",
    type: "Full-time",
    salary: "₹6–9 LPA",
    description: "Build accessible, responsive web experiences with a collaborative product team.",
    skills: ["React", "JavaScript", "CSS"],
    postedBy: "sample-employer",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    _id: "sample-job-2",
    title: "Product Design Intern",
    company: "Northstar Studio",
    location: "Bengaluru",
    type: "Internship",
    salary: "₹20,000/month",
    description: "Support research, prototyping, and design system work across a growing product.",
    skills: ["Figma", "Prototyping", "Design Systems"],
    postedBy: "sample-employer",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    _id: "sample-job-3",
    title: "Backend Engineer",
    company: "Copperline",
    location: "Chennai",
    type: "Full-time",
    salary: "₹8–12 LPA",
    description: "Design and maintain reliable APIs and data services for customer-facing products.",
    skills: ["Node.js", "Express", "MongoDB"],
    postedBy: "sample-employer",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "sample-job-4",
    title: "Data Analyst",
    company: "Moonwell Analytics",
    location: "Remote",
    type: "Full-time",
    salary: "₹7–10 LPA",
    description: "Turn product and customer data into clear insights that help teams make better decisions.",
    skills: ["SQL", "Python", "Data Visualization"],
    postedBy: "sample-employer",
    createdAt: "2026-01-06T00:00:00.000Z",
  },
  {
    _id: "sample-job-5",
    title: "UX Designer",
    company: "Violet Harbor",
    location: "Pune",
    type: "Contract",
    salary: "₹5–8 LPA",
    description: "Shape thoughtful user journeys and accessible interfaces for a new digital product.",
    skills: ["Figma", "UX Research", "Accessibility"],
    postedBy: "sample-employer",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    _id: "sample-job-6",
    title: "Cloud Support Associate",
    company: "Kiteforge Systems",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹4–6 LPA",
    description: "Help customers troubleshoot cloud deployments and improve their platform experience.",
    skills: ["Linux", "Networking", "Cloud"],
    postedBy: "sample-employer",
    createdAt: "2026-01-04T00:00:00.000Z",
  },
];

function readCollection(key, initialValue = []) {
  const deletedSampleJobs =
    key === storageKeys.jobs
      ? new Set(
          JSON.parse(localStorage.getItem(storageKeys.deletedSampleJobs) || "[]")
        )
      : new Set();
  const saved = localStorage.getItem(key);
  if (saved === null) {
    const defaults = initialValue.filter(
      (entry) => !deletedSampleJobs.has(entry._id)
    );
    writeCollection(key, defaults);
    return defaults;
  }

  try {
    const value = JSON.parse(saved);
    if (!Array.isArray(value)) throw new Error("Stored value is not a list");

    const savedIds = new Set(value.map((entry) => entry?._id));
    const newDefaults = initialValue.filter(
      (entry) =>
        !savedIds.has(entry._id) && !deletedSampleJobs.has(entry._id)
    );
    if (newDefaults.length) {
      const merged = [...value, ...newDefaults];
      writeCollection(key, merged);
      return merged;
    }

    return value;
  } catch (error) {
    throw new Error(`Could not read offline data (${key}): ${error.message}`);
  }
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function apiError(message, status = 400) {
  const error = new Error(message);
  error.response = { data: { message }, status };
  return error;
}

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw apiError("Offline accounts require running the app on localhost.", 500);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  return encodeBase64(bits);
}

function createSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function currentUser() {
  const token = localStorage.getItem("token");
  const tokens = readCollection(storageKeys.tokens);
  const session = tokens.find((entry) => entry.token === token);
  if (!session) throw apiError("Please login first.", 401);

  const user = readCollection(storageKeys.users).find(
    (entry) => entry._id === session.userId
  );
  if (!user) throw apiError("Please login first.", 401);
  return user;
}

function adminUser() {
  const user = currentUser();
  if (user.role !== "admin") throw apiError("Admin access required.", 403);
  return user;
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function response(data) {
  return { data };
}

const offlineApi = {
  async get(path) {
    const [pathname, query = ""] = path.split("?");
    const params = new URLSearchParams(query);

    if (pathname === "/jobs") {
      const term = (params.get("search") || "").trim().toLowerCase();
      const jobs = readCollection(storageKeys.jobs, sampleJobs)
        .filter((job) =>
          [job.title, job.company, job.location, ...(job.skills || [])]
            .some((value) => String(value).toLowerCase().includes(term))
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return response(jobs);
    }

    const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
    if (jobMatch) {
      const job = readCollection(storageKeys.jobs, sampleJobs).find(
        (entry) => entry._id === jobMatch[1]
      );
      if (!job) throw apiError("Job not found", 404);
      return response(job);
    }

    if (pathname === "/applications/mine") {
      const user = currentUser();
      const jobs = readCollection(storageKeys.jobs, sampleJobs);
      const applications = readCollection(storageKeys.applications)
        .filter((application) => application.applicant === user._id)
        .map((application) => ({
          ...application,
          job: jobs.find((job) => job._id === application.job) || null,
        }));
      return response(applications);
    }

    if (pathname === "/applications/received") {
      const user = currentUser();
      const jobs = readCollection(storageKeys.jobs, sampleJobs);
      const applications = readCollection(storageKeys.applications)
        .filter((application) =>
          jobs.some(
            (job) => job._id === application.job && job.postedBy === user._id
          )
        )
        .map((application) => ({
          ...application,
          job: jobs.find((job) => job._id === application.job) || null,
          applicant: publicUser(
            readCollection(storageKeys.users).find(
              (entry) => entry._id === application.applicant
            ) || { _id: "", name: "", email: "", role: "jobseeker" }
          ),
        }));
      return response(applications);
    }

    if (pathname === "/admin/dashboard") {
      adminUser();
      const users = readCollection(storageKeys.users).map(publicUser);
      const jobs = readCollection(storageKeys.jobs, sampleJobs);
      const applications = readCollection(storageKeys.applications).map(
        (application) => ({
          ...application,
          job: jobs.find((job) => job._id === application.job) || null,
          applicant: publicUser(
            readCollection(storageKeys.users).find(
              (entry) => entry._id === application.applicant
            ) || { _id: "", name: "Unknown user", email: "", role: "jobseeker" }
          ),
        })
      );
      return response({ users, jobs, applications });
    }

    throw apiError("Offline API route not found", 404);
  },

  async post(path, body = {}) {
    if (path === "/auth/register") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!name || !email || !password) {
        throw apiError("Name, email and password are required");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw apiError("Enter a valid email address");
      }
      if (password.length < 6) {
        throw apiError("Password must be at least 6 characters");
      }

      const users = readCollection(storageKeys.users);
      if (users.some((user) => user.email === email)) {
        throw apiError("Email already registered", 409);
      }

      const salt = createSalt();
      const user = {
        _id: makeId(),
        name,
        email,
        role: ["employer", "admin"].includes(body.role)
          ? body.role
          : "jobseeker",
        passwordSalt: encodeBase64(salt),
        passwordHash: await hashPassword(password, salt),
      };
      users.push(user);
      writeCollection(storageKeys.users, users);
      const token = makeId();
      const tokens = readCollection(storageKeys.tokens);
      tokens.push({ token, userId: user._id });
      writeCollection(storageKeys.tokens, tokens);
      return response({ token, user: publicUser(user) });
    }

    if (path === "/auth/login") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = readCollection(storageKeys.users).find(
        (entry) => entry.email === email
      );
      if (
        !user ||
        (await hashPassword(password, decodeBase64(user.passwordSalt))) !==
          user.passwordHash
      ) {
        throw apiError("Invalid email or password", 401);
      }

      const token = makeId();
      const tokens = readCollection(storageKeys.tokens);
      tokens.push({ token, userId: user._id });
      writeCollection(storageKeys.tokens, tokens);
      return response({ token, user: publicUser(user) });
    }

    if (path === "/jobs") {
      const user = currentUser();
      if (user.role !== "employer") {
        throw apiError("Only employers can post jobs", 403);
      }
      const job = {
        ...body,
        _id: makeId(),
        title: String(body.title || "").trim(),
        company: String(body.company || "").trim(),
        location: String(body.location || "").trim(),
        description: String(body.description || "").trim(),
        salary: String(body.salary || "Not specified"),
        skills: Array.isArray(body.skills) ? body.skills : [],
        postedBy: user._id,
        createdAt: new Date().toISOString(),
      };
      if (!job.title || !job.company || !job.location || !job.description) {
        throw apiError("Title, company, location and description are required");
      }

      const jobs = readCollection(storageKeys.jobs, sampleJobs);
      jobs.push(job);
      writeCollection(storageKeys.jobs, jobs);
      return response(job);
    }

    const applicationMatch = path.match(/^\/applications\/([^/]+)$/);
    if (applicationMatch) {
      const user = currentUser();
      if (user.role !== "jobseeker") {
        throw apiError("Only job seekers can apply", 403);
      }
      const jobs = readCollection(storageKeys.jobs, sampleJobs);
      const job = jobs.find((entry) => entry._id === applicationMatch[1]);
      if (!job) throw apiError("Job not found", 404);

      const applications = readCollection(storageKeys.applications);
      if (
        applications.some(
          (entry) =>
            entry.job === job._id && entry.applicant === user._id
        )
      ) {
        throw apiError("You have already applied", 409);
      }

      const application = {
        _id: makeId(),
        job: job._id,
        applicant: user._id,
        message: String(body.message || "").trim(),
        status: "Submitted",
        createdAt: new Date().toISOString(),
      };
      applications.push(application);
      writeCollection(storageKeys.applications, applications);
      return response(application);
    }

    throw apiError("Offline API route not found", 404);
  },

  async patch(path, body = {}) {
    const applicationMatch = path.match(/^\/admin\/applications\/([^/]+)$/);
    if (!applicationMatch) throw apiError("Offline API route not found", 404);

    adminUser();
    const statuses = ["Submitted", "Reviewing", "Shortlisted", "Rejected"];
    if (!statuses.includes(body.status)) {
      throw apiError("Invalid application status");
    }

    const applications = readCollection(storageKeys.applications);
    const application = applications.find(
      (entry) => entry._id === applicationMatch[1]
    );
    if (!application) throw apiError("Application not found", 404);

    application.status = body.status;
    writeCollection(storageKeys.applications, applications);
    return response(application);
  },

  async delete(path) {
    const jobMatch = path.match(/^\/admin\/jobs\/([^/]+)$/);
    if (!jobMatch) throw apiError("Offline API route not found", 404);

    adminUser();
    const jobs = readCollection(storageKeys.jobs, sampleJobs);
    if (!jobs.some((job) => job._id === jobMatch[1])) {
      throw apiError("Job not found", 404);
    }

    writeCollection(
      storageKeys.jobs,
      jobs.filter((job) => job._id !== jobMatch[1])
    );
    if (sampleJobs.some((job) => job._id === jobMatch[1])) {
      const deletedSampleJobs = new Set(
        JSON.parse(localStorage.getItem(storageKeys.deletedSampleJobs) || "[]")
      );
      deletedSampleJobs.add(jobMatch[1]);
      writeCollection(storageKeys.deletedSampleJobs, [...deletedSampleJobs]);
    }
    const applications = readCollection(storageKeys.applications);
    writeCollection(
      storageKeys.applications,
      applications.filter((application) => application.job !== jobMatch[1])
    );
    return response({ message: "Job and related applications deleted" });
  },
};

export default offlineApi;
