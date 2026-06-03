import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//  Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, baseSalary } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    if (!role) return res.status(400).json({ message: "Role is required" });

    const userData = { name, email, password, role };

    //Employee-specific fields
    if (role === "Employee") {
      userData.department = department || "Not Assigned";
      userData.designation = designation || "Not Assigned";
      userData.baseSalary = baseSalary || 30000;
      userData.joinDate = new Date();
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};


// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

//Verify token for local login
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Google Auth Success
export const googleAuthSuccess = (req, res) => {
  if (!req.user) return res.status(400).json({ message: "No user data" });
  const token = generateToken(req.user._id);
  res.status(200).json({
    message: "Google login successful",
    token,
    role: req.user.role,
    name: req.user.name,
    email: req.user.email,
  });
};
