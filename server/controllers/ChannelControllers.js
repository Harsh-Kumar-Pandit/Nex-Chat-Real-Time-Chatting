import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) return res.status(400).send("Admin user not found");

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length)
      return res.status(400).send("Some members are not valid users.");

    const allMembers = [...new Set([...members, userId])];

    const newChannel = new Channel({ name, members: allMembers, admin: userId });
    await newChannel.save();

    const populatedChannel = await Channel.findById(newChannel._id)
      .populate("members", "firstName lastName email image color")
      .populate("admin", "firstName lastName email");

    return res.status(201).json({ channel: populatedChannel });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("members", "firstName lastName email image color")
      .populate("admin", "firstName lastName email")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: {
          path: "sender",
          select: "firstName lastName email",
        },
      })
      .sort({ updatedAt: -1 });

    const shaped = channels.map((ch) => {
      const chObj = ch.toObject();
      const last = chObj.messages?.[0] ?? null;
      return {
        ...chObj,
        lastMessage: last
          ? { content: last.content, messageType: last.messageType }
          : null,
        messages: undefined,
      };
    });

    return res.status(200).json({ channels: shaped });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email image color _id",
      },
    });

    if (!channel) return res.status(404).send("Channel not found.");

    return res.status(200).json({ messages: channel.messages });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};