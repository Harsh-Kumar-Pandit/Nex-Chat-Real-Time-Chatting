import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import fs from "fs/promises";
import path from "path";


const jwtMaxAge = 3 * 24 * 60 * 60;   // seconds
const cookieMaxAge = jwtMaxAge * 1000; // ms

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: jwtMaxAge,
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email & password required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    const user = await User.create({ email, password });

    const token = createToken(email, user.id);

    res.cookie("jwt", token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // compare password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials.");
    }

    // create token
    const token = createToken(email, user.id);

    // set cookie
    res.cookie("jwt", token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // works locally & in prod
      sameSite: "None",
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
    const userId = req.userId; 

    const user = await User.findById(userId).select("-password");
    console.log(userId);
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
    const userId = req.userId; 

    const { firstName, lastName, color } = req.body;

    if ( !firstName || !lastName || color === undefined) {
      return res.status(400).send("Firstname lastname and color is required")
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName, lastName, color, profileSetup: true,
      },
      {new: true, runValidators: true}
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
    console.log("USER INFO ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const addProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required.");
    }

    const safeName = req.file.originalname.replace(/\s+/g, "-");
    const fileName = `${Date.now()}-${safeName}`;

    const uploadPath = path.join(
      process.cwd(),
      "uploads",
      "profiles",
      fileName
    );

    await fs.rename(req.file.path, uploadPath);

    const imagePath = `uploads/profiles/${fileName}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: imagePath },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      image: updatedUser.image,
    });

  } catch (error) {
    console.log("IMAGE UPLOAD ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).send("User not found");
    }

    if (user.image) {
      const imagePath = path.join(process.cwd(), user.image);

      try {
        await fs.unlink(imagePath);
        console.log("Image deleted:", imagePath);
      } catch (err) {
        console.log("Image not found on disk:", imagePath);
      }
    }

    user.image = null;
    await user.save();

    return res.status(200).json({
      message: "Profile image removed",
    });

  } catch (error) {
    console.log("REMOVE IMAGE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};export const logOut = async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 1, secure: true, sameSite: "None"})
    return res.status(200).json({ message: "LogOut" });

  } catch (error) {
    console.log("REMOVE IMAGE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
