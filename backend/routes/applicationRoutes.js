import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// The frontend calls POST /api/applications/:jobId.
router.post("/:jobId", protect, allowRoles("jobseeker"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      message: String(req.body.message || "").trim()
    });
    return res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already applied" });
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid job ID" });
    console.error("Apply error:", error);
    return res.status(500).json({ message: "Could not submit application" });
  }
});

// The frontend calls GET /api/applications/mine.
router.get("/mine", protect, allowRoles("jobseeker"), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location")
      .sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error("My applications error:", error);
    return res.status(500).json({ message: "Could not load applications" });
  }
});

// The frontend calls GET /api/applications/received.
router.get("/received", protect, allowRoles("employer"), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).select("_id");
    const applications = await Application.find({ job: { $in: jobs.map(job => job._id) } })
      .populate("job", "title company location")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error("Received applications error:", error);
    return res.status(500).json({ message: "Could not load received applications" });
  }
});

export default router;
