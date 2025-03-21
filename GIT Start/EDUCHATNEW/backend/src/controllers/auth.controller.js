import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; // Ensure bcrypt is imported

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate role
    if (role && !["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'student' or 'teacher'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role
    const newUser = new User({
      fullName: fullName || "",
      email,
      password: hashedPassword,
      role: role || "student", // Use provided role or default to "student"
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login attempt - Request body:", req.body); // Log the incoming request
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("Searching for user with email:", email);
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Comparing password...");
    const isMatch = await user.comparePassword(password); // Use the method from the model
    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Generating JWT token...");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated JWT token:", token);

    console.log("Setting cookie...");
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour in milliseconds
    });
    console.log("Cookie set, response:", req.cookies);

    // Include role in the response
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role, // Add role to the response
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Include role in the response
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role, // Add role to the response
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, email, password },
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role, // Include role in the response
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};