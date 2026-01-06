const mongoose = require("mongoose");

const { Schema } = mongoose;

const interviewSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Interview title is required."],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required."],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time of interview is required."],
    },
    endTime: {
      type: Date,
      required: [true, "End time of interview is required."],
    },
    usersInvited: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;