import express from "express";
import Job from "../models/Job.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Public: list/search jobs. Supports the frontend's /jobs?search=... request.
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const term = String(req.query.search || "").trim().slice(0, 100);
    if (term) {
      const safeTerm = escapeRegex(term);
      filter.$or = [
        { title: { $regex: safeTerm, $options: "i" } },
        { company: { $regex: safeTerm, $options: "i" } },
        { location: { $regex: safeTerm, $options: "i" } },
        { skills: { $regex: safeTerm, $options: "i" } }
      ];
    }
    const jobs = await Job.find(filter)
      .populate("postedBy", "name")
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(jobs);
  } catch (error) {
    console.error("List jobs error:", error);
    return res.status(500).json({ message: "Could not load jobs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json(job);
  } catch {
    return res.status(400).json({ message: "Invalid job ID" });
  }
});

// Employer-only: create a job.
router.post("/", protect, allowRoles("employer"), async (req, res) => {
  try {
    const { title, company, location, type, salary, description, skills } = req.body;
    if (![title, company, location, description].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Title, company, location and description are required" });
    }
    const job = await Job.create({
      title: title.trim(), company: company.trim(), location: location.trim(),
      type, salary: salary || "Not specified", description: description.trim(),
      skills: Array.isArray(skills) ? skills.map(String).map(s => s.trim()).filter(Boolean).slice(0, 30) : [],
      postedBy: req.user._id
    });
    return res.status(201).json(job);
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(400).json({ message: "Could not create job" });
  }
});

router.put("/:id", protect, allowRoles("employer"), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const allowed = ["title", "company", "location", "type", "salary", "description", "skills"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) job[key] = req.body[key];
    }
    await job.save();
    return res.json(job);
  } catch {
    return res.status(400).json({ message: "Could not update job" });
  }
});

router.delete("/:id", protect, allowRoles("employer"), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    await (await import("../models/Application.js")).default.deleteMany({ job: job._id });
    return res.json({ message: "Job deleted" });
  } catch {
    return res.status(400).json({ message: "Could not delete job" });
  }
});

export default router;
