import { Types } from "mongoose";
import { IUser } from "../models/user";
import { IInterview } from "../models/interview";

export interface AddInterviewInput {
  title: string;
  role: string;
  startTime: string | Date;
  endTime: string | Date;
  usersInvited: string[];
}

export interface UpdateInterviewInput extends AddInterviewInput {
  interviewId: string;
}

export type UserWithInterviews = Omit<IUser, "interviewsScheduled"> & {
  interviewsScheduled?: Array<{
    _id: Types.ObjectId;
    startTime: Date;
    endTime: Date;
  }>;
};

export type LeanInterview = IInterview & {
  usersInvited: Types.ObjectId[] | string[];
};


