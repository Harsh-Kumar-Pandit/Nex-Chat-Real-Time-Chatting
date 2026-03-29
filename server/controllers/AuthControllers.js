import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jwtMaxAge = 3 * 24 * 60 * 60;
const cookieMaxAge = jwtMaxAge * 1000;
const isProduction = process.env.NODE_ENV === "production";

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: jwtMaxAge,
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Email & password required");

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).send("User already exists");

    const user = await User.create({ email, password });
    const token = createToken(email, user.id);

    res.cookie("jwt", token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email, profileSetup: user.profileSetup },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Email and password are required.");

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials.");

    const token = createToken(email, user.id);
    res.cookie("jwt", token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log("USER INFO ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName || color === undefined)
      return res.status(400).send("firstName, lastName and color are required");

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      id: user.id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      color: user.color,
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("File is required.");

    // Ensure destination folder exists
    const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = req.file.originalname.replace(/\s+/g, "-");
    const finalFileName = `${Date.now()}-${safeName}`;
    const destPath = path.join(uploadDir, finalFileName);

    // ✅ copyFile + unlink instead of rename (safe across tmp/device boundaries)
    await fs.copyFile(req.file.path, destPath);
    await fs.unlink(req.file.path).catch(() => {});

    // relative path — frontend prepends HOST
    const relativePath = `uploads/profiles/${finalFileName}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: relativePath },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ image: updatedUser.image });
  } catch (error) {
    console.log("IMAGE UPLOAD ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found");

    if (user.image) {
      // __dirname is controllers/, go up one level to server root
      const imagePath = path.join(__dirname, "..", user.image);
      console.log("Deleting image at:", imagePath);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log("File already deleted or missing:", err.message);
        // still clear from DB
      }
    }

    user.image = null;
    await user.save();

    return res.status(200).json({ message: "Profile image removed" });
  } catch (error) {
    console.log("REMOVE IMAGE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
    return res.status(200).json({ message: "LogOut" });
  } catch (error) {
    console.log("LOGOUT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
