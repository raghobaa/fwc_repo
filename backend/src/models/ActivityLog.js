import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      enum: [
        "USER_CREATED", "USER_DELETED", "USER_ROLE_CHANGED",
        "JOB_CREATED", "JOB_DELETED",
        "LEAVE_APPROVED", "LEAVE_REJECTED",
        "ANNOUNCEMENT_CREATED", "ANNOUNCEMENT_DELETED",
        "DEPARTMENT_CREATED", "DEPARTMENT_UPDATED", "DEPARTMENT_DELETED",
        "EMPLOYEE_CREATED", "PAYROLL_GENERATED",
      ],
    },
    performedBy: { type: String, required: true },
    performedByRole: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
