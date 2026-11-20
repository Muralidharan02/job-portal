import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, trim: true, default: "", maxlength: 3000 },
  status: { type: String, enum: ["Submitted", "Reviewing", "Shortlisted", "Rejected"], default: "Submitted" }
}, { timestamps: true });

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
export default mongoose.model("Application", applicationSchema);
