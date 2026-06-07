import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ activityType, performedBy, performedByRole, description }) => {
  try {
    await ActivityLog.create({ activityType, performedBy, performedByRole, description });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};
