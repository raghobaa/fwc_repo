import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Public registration — Candidates only
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role: "Candidate" });
    const token = generateToken(user);

    res.status(201).json({
      message: "Registered successfully",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// One-time setup — creates the first Admin (fails if any Admin already exists)
export const setupAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ role: "Admin" });
    if (existing)
      return res.status(409).json({ message: "Admin already exists. Use admin login." });

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already in use" });

    const admin = await User.create({ name, email, password, role: "Admin" });
    const token = generateToken(admin);

    res.status(201).json({
      message: "Admin account created",
      token,
      role: admin.role,
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ message: "Setup failed", error: error.message });
  }
};


// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

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
