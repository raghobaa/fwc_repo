import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 6 },

    role: {
      type: String,
      enum: ["Admin", "HR", "Employee", "Candidate"],
      default: "Employee",
    },

    onboardingStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    skills: [
      {
        name: { type: String, trim: true },
        level: { type: Number, min: 0, max: 100, default: 50 },
      },
    ],

    googleId: { type: String, default: null },
  },
  { timestamps: true }
);

// 🔐 Hash password if it's modified
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
