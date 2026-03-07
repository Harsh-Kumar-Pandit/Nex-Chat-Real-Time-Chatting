import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessageModal.js";

export const searchContacts = async (request, response) => {
  try {
    const { searchTerm } = request.body;

    if (!searchTerm) {
      return response.status(400).send("searchTerm is required.");
    }

    // sanitize regex special characters
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.userId } }, // exclude current user
        {
          $or: [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
          ],
        },
      ],
    }).select("firstName lastName email image color");

    return response.status(200).json({ contacts });

  } catch (error) {
    console.log("SEARCH ERROR:", error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getContactsForDMList = async (request, response) => {
  try {
    let { userId } = request;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      { $sort: { createdAt: -1 } }, 
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$createdAt" }, 
          lastMessageContent: { $first: "$content" },
          lastMessageType: { $first: "$messageType" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      { $unwind: "$contactInfo" },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
          lastMessage: {
            content: "$lastMessageContent",
            messageType: "$lastMessageType",
          },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
export const getAllContacts = async (request, response) => {
  try {
    const users = await User.find(
      { _id: { $ne: request.userId } },
      "firstName lastName email image color" 
    );

    return response.status(200).json({ contacts: users });

  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};