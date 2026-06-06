import Interview from "../models/Interview.js";
import User from "../models/User.js";

// Get all interviews (HR sees all, others see their own)
export const listInterviews = async (req, res) => {
  try {
    let interviews;
    
    if (req.user.role === "HR" || req.user.role === "Admin") {
      interviews = await Interview.find()
        .populate("candidateId", "name email")
        .populate("interviewerIds", "name email")
        .populate("createdBy", "name");
    } else if (req.user.role === "Candidate") {
      interviews = await Interview.find({ candidateId: req.user._id })
        .populate("interviewerIds", "name email");
    } else {
      interviews = await Interview.find({ interviewerIds: req.user._id })
        .populate("candidateId", "name email");
    }
    
    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidateId", "name email")
      .populate("interviewerIds", "name email");
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user.role === "HR" || 
      req.user.role === "Admin" ||
      interview.candidateId._id.toString() === req.user._id.toString() ||
      interview.interviewerIds.some(i => i._id.toString() === req.user._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get interview by room ID
export const getInterviewByRoom = async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId })
      .populate("candidateId", "name email")
      .populate("interviewerIds", "name email");
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create interview (HR only)
export const createInterview = async (req, res) => {
  try {
    const { title, candidateId, interviewerIds, scheduledAt, duration, roomId, notes } = req.body;
    
    const interview = new Interview({
      title,
      candidateId,
      interviewerIds,
      scheduledAt,
      duration,
      roomId,
      notes,
      createdBy: req.user._id,
      status: "scheduled"
    });
    
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update interview (HR only)
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    const { title, scheduledAt, duration, notes, status } = req.body;
    
    if (title) interview.title = title;
    if (scheduledAt) interview.scheduledAt = scheduledAt;
    if (duration) interview.duration = duration;
    if (notes) interview.notes = notes;
    if (status) interview.status = status;
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete/Cancel interview (HR only)
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    await interview.deleteOne();
    res.json({ message: "Interview cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Alias for cancelInterview (for backward compatibility)
export const cancelInterview = deleteInterview;

// Submit feedback (HR only)
export const submitFeedback = async (req, res) => {
  try {
    const { interviewId, feedback, rating } = req.body;
    
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    interview.notes = feedback;
    interview.status = "completed";
    await interview.save();
    
    res.json({ message: "Feedback submitted successfully", interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};