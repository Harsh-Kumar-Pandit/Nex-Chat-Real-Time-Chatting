import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Channel = mongoose.model("Channels", channelSchema);

export default Channel;