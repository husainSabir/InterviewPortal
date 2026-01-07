import { Schema, model, Document, Types } from "mongoose";
import { isEmail } from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  interviewsScheduled: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "name is required."],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "email is requried."],
      unique: [true, "email is already taken."],
      validate: [isEmail, "invalid email"],
    },
    interviewsScheduled: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema);

export default User;



