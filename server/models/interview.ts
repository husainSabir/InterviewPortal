import { Schema, model, Document, Types } from "mongoose";

export interface IInterview extends Document {
  title: string;
  role: string;
  companyName: string;
  roleDescription: string;
  companyDescription: string;
  startTime: Date;
  endTime: Date;
  usersInvited: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const interviewSchema = new Schema<IInterview>(
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
    companyName: {
      type: String,
      required: [true, "Company name is required."],
      trim: true,
    },
    roleDescription: {
      type: String,
      required: [true, "Role description is required."],
      trim: true,
    },
    companyDescription: {
      type: String,
      required: [true, "Company description is required."],
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

const Interview = model<IInterview>("Interview", interviewSchema);

export default Interview;



