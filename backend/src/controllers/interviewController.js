import Interview from "../models/Interview.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import mongoose from "mongoose";

const toDate = (v) => (v instanceof Date ? v : new Date(v));
const isObjId = (id) => mongoose.Types.ObjectId.isValid(id);

const overlaps = async ({ scheduledAt, duration, candidateId, interviewerIds, excludeId }) => {
  const start = toDate(scheduledAt);
  const end = new Date(start.getTime() + Number(duration || 60) * 60000);

  const baseQuery = {
    status: { $in: ["scheduled", "in_progress"] },
    $expr: {
      $lt: ["$scheduledAt", end],
    },
  };

  const interviewerQuery = {
    ...baseQuery,
    interviewerIds: { $in: interviewerIds?.map((id) => new mongoose.Types.ObjectId(id)) || [] },
  };
  const queries = [interviewerQuery];

  if (candidateId && isObjId(candidateId)) {
    queries.push({
      ...baseQuery,
      candidateId: new mongoose.Types.ObjectId(candidateId),
    });
  }

  if (excludeId) {
    interviewerQuery._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    queries.forEach((query) => {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    });
  }

  const conflicts = await Interview.find({
    $or: queries,
  });

  // Further refine by checking computed end time overlap
  const hasOverlap = conflicts.some((iv) => {
    const ivStart = new Date(iv.scheduledAt);
    const ivEnd = new Date(ivStart.getTime() + Number(iv.duration || 60) * 60000);
    return ivStart < end && start < ivEnd;
  });

  return hasOverlap;
};

export const listInterviews = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = {};
    if (role === "HR" || role === "Admin") {
      // HR sees all
      filter = {};
    } else {
      // Others see their own
      filter = { $or: [{ candidateId: _id }, { interviewerIds: _id }] };
    }
    const items = await Interview.find(filter)
      .sort({ scheduledAt: 1 })
      .populate("candidateId", "name email role")
      .populate("jobApplicationId", "candidateName candidateEmail jobId")
      .populate("interviewerIds", "name email role")
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed to list interviews", error: String(e) });
  }
};

export const getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid interview ID" });
    const iv = await Interview.findById(id)
      .populate("candidateId", "name email role")
      .populate("jobApplicationId", "candidateName candidateEmail jobId")
      .populate("interviewerIds", "name email role");
    if (!iv) return res.status(404).json({ message: "Interview not found" });
    res.json(iv);
  } catch (e) {
    res.status(500).json({ message: "Failed to get interview", error: String(e) });
  }
};

export const getInterviewByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const iv = await Interview.findOne({ roomId })
      .populate("candidateId", "name email role")
      .populate("jobApplicationId", "candidateName candidateEmail jobId")
      .populate("interviewerIds", "name email role");
    if (!iv) return res.status(404).json({ message: "Interview not found" });
    // authorize: HR or participant
    const uid = req.user._id.toString();
    const isParticipant = iv.candidateId?._id?.toString() === uid || (iv.interviewerIds || []).some((p) => p?._id?.toString() === uid);
    const isHR = req.user.role === 'HR' || req.user.role === 'Admin';
    if (!isParticipant && !isHR) return res.status(403).json({ message: "Forbidden" });
    res.json(iv);
  } catch (e) {
    res.status(500).json({ message: "Failed to get interview by room", error: String(e) });
  }
};

export const createInterview = async (req, res) => {
  try {
    const { title, candidateId, jobApplicationId, candidateName, candidateEmail, interviewerIds, scheduledAt, duration, notes } = req.body;
    if (!title || (!candidateId && !jobApplicationId) || !Array.isArray(interviewerIds) || interviewerIds.length === 0 || !scheduledAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (candidateId && !isObjId(candidateId)) return res.status(400).json({ message: "Invalid candidateId" });
    if (jobApplicationId && !isObjId(jobApplicationId)) return res.status(400).json({ message: "Invalid jobApplicationId" });
    const invalidInterviewer = interviewerIds.find((x) => !isObjId(x));
    if (invalidInterviewer) return res.status(400).json({ message: "Invalid interviewerIds" });
    const scheduledDate = toDate(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ message: "Interview must be scheduled for a future date and time" });
    }

    const roomId = `room_${new mongoose.Types.ObjectId().toString()}`;
    const payload = {
      title,
      candidateId: candidateId || undefined,
      jobApplicationId: jobApplicationId || undefined,
      candidateName: candidateName || "",
      candidateEmail: candidateEmail || "",
      interviewerIds,
      scheduledAt: scheduledDate,
      duration: Number(duration || 60),
      status: "scheduled",
      roomId,
      notes: notes || "",
      createdBy: req.user._id,
    };

    const conflict = await overlaps({ ...payload });
    if (conflict) return res.status(409).json({ message: "Time slot overlaps for a participant" });

    const iv = await Interview.create(payload);
    res.status(201).json(iv);
  } catch (e) {
    res.status(500).json({ message: "Failed to create interview", error: String(e) });
  }
};

export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid interview ID" });
    const { title, candidateId, jobApplicationId, candidateName, candidateEmail, interviewerIds, scheduledAt, duration, status, notes } = req.body;

    const iv = await Interview.findById(id);
    if (!iv) return res.status(404).json({ message: "Interview not found" });

    if (candidateId && !isObjId(candidateId)) return res.status(400).json({ message: "Invalid candidateId" });
    if (jobApplicationId && !isObjId(jobApplicationId)) return res.status(400).json({ message: "Invalid jobApplicationId" });
    if (interviewerIds) {
      if (!Array.isArray(interviewerIds) || interviewerIds.length === 0) return res.status(400).json({ message: "interviewerIds must be a non-empty array" });
      const bad = interviewerIds.find((x) => !isObjId(x));
      if (bad) return res.status(400).json({ message: "Invalid interviewerIds" });
    }

    const scheduledDate = scheduledAt ? toDate(scheduledAt) : iv.scheduledAt;
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ message: "Interview must be scheduled for a future date and time" });
    }

    const updated = {
      title: title ?? iv.title,
      candidateId: candidateId || undefined,
      jobApplicationId: jobApplicationId ?? iv.jobApplicationId,
      candidateName: candidateName ?? iv.candidateName,
      candidateEmail: candidateEmail ?? iv.candidateEmail,
      interviewerIds: interviewerIds ?? iv.interviewerIds,
      scheduledAt: scheduledDate,
      duration: duration ? Number(duration) : iv.duration,
      status: status ?? iv.status,
      notes: notes ?? iv.notes,
    };

    const conflict = await overlaps({ ...updated, excludeId: id });
    if (conflict) return res.status(409).json({ message: "Time slot overlaps for a participant" });

    Object.assign(iv, updated);
    await iv.save();
    res.json(iv);
  } catch (e) {
    res.status(500).json({ message: "Failed to update interview", error: String(e) });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjId(id)) return res.status(400).json({ message: "Invalid interview ID" });
    const iv = await Interview.findById(id);
    if (!iv) return res.status(404).json({ message: "Interview not found" });
    iv.status = "cancelled";
    await iv.save();
    res.json(iv);
  } catch (e) {
    res.status(500).json({ message: "Failed to cancel interview", error: String(e) });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { interviewId, scores, summary, recommendation } = req.body;
    const existing = await Interview.findById(interviewId);
    if (!existing) return res.status(404).json({ message: "Interview not found" });

    const fb = await InterviewFeedback.findOneAndUpdate(
      { interviewId, submittedBy: req.user._id },
      { interviewId, submittedBy: req.user._id, scores: scores || {}, summary: summary || "", recommendation: recommendation || "hold" },
      { upsert: true, new: true }
    );

    // auto-mark completed if in progress or scheduled and has feedback
    if (existing.status !== "completed") {
      existing.status = "completed";
      await existing.save();
    }

    res.status(201).json(fb);
  } catch (e) {
    res.status(500).json({ message: "Failed to submit feedback", error: String(e) });
  }
};
