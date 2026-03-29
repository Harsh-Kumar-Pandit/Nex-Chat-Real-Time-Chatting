import Message from "../models/MessageModal.js";
import { mkdirSync } from "fs";
import { copyFile, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMessages = async (req, res) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required.");
    }
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({ messages });
  } catch (error) {
    console.log("MESSAGE FETCH ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    // ✅ Absolute path based on controllers dir
    const fileDir = path.join(__dirname, "..", "uploads", "files", `${date}`);
    const fileName = path.join(fileDir, req.file.originalname);

    mkdirSync(fileDir, { recursive: true });

    // ✅ copyFile + unlink instead of renameSync (safe across tmp/device boundaries)
    await copyFile(req.file.path, fileName);
    await unlink(req.file.path).catch(() => {});

    // ✅ Return relative path so frontend can prepend HOST
    const relativePath = `uploads/files/${date}/${req.file.originalname}`;

    return res.status(200).json({ filePath: relativePath });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
};
