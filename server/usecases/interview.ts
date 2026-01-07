import { Types } from "mongoose";
import User from "../models/user";
import Interview, { IInterview } from "../models/interview";
import isOverlaps from "../utils/overlap";
import {
  AddInterviewInput,
  UpdateInterviewInput,
  UserWithInterviews,
  LeanInterview,
  GenerateDescriptionsInput,
  GenerateDescriptionsOutput,
} from "../types/interview";
import { generateBothDescriptions } from "../utils/aiService";

const ensureValidWindow = (startTime: Date, endTime: Date): void => {
  if (endTime < startTime) {
    throw new Error("End Time cannot be before Start Time");
  }

  if (startTime.getTime() < Date.now()) {
    throw new Error("Start Time cannot be before current time");
  }
};

export const addInterview = async ({
  title,
  role,
  companyName,
  roleDescription,
  companyDescription,
  startTime,
  endTime,
  usersInvited,
}: AddInterviewInput): Promise<{ message: string }> => {
  if (!title || title.trim() === "") {
    throw new Error("Interview title is required");
  }
  if (!role || role.trim() === "") {
    throw new Error("Role is required");
  }
  if (!companyName || companyName.trim() === "") {
    throw new Error("Company name is required");
  }
  if (!roleDescription || roleDescription.trim() === "") {
    throw new Error("Role description is required");
  }
  if (!companyDescription || companyDescription.trim() === "") {
    throw new Error("Company description is required");
  }
  if (!startTime) {
    throw new Error("Start Time is not valid");
  }
  if (!endTime) {
    throw new Error("End Time is not valid");
  }
  if (!usersInvited) {
    throw new Error("User Invited is not valid");
  }
  if (usersInvited.length <= 1) {
    throw new Error("Total users invited should be atleast 2");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  ensureValidWindow(start, end);

  const users = await User.find({ email: { $in: usersInvited } })
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean<UserWithInterviews[]>()
    .exec();

  const userIds: Types.ObjectId[] = [];
  for (const user of users) {
    userIds.push(user._id);
  }

  const newInterview = {
    title: title.trim(),
    role: role.trim(),
    companyName: companyName.trim(),
    roleDescription: roleDescription.trim(),
    companyDescription: companyDescription.trim(),
    startTime: start,
    endTime: end,
    usersInvited: userIds,
  };

  const interview = await new Interview(newInterview).save();

  await Promise.all(
    users.map((user) =>
      User.updateOne(
        { _id: user._id },
        { $push: { interviewsScheduled: interview._id } }
      )
    )
  );

  return { message: "Interview Added" };
};

export const getAvailableUsers = async ({
  startTime,
  endTime,
}: {
  startTime: string | Date;
  endTime: string | Date;
}): Promise<{ availableUser: string[]; message: string }> => {
  if (!startTime) {
    throw new Error("Start Time is not valid");
  }
  if (!endTime) {
    throw new Error("End Time is not valid");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  ensureValidWindow(start, end);

  const users = await User.find({})
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean<UserWithInterviews[]>()
    .exec();

  const availableUser: string[] = [];
  for (const user of users) {
    let isAvailable = true;
    user?.interviewsScheduled?.forEach((interview) => {
      if (interview instanceof Types.ObjectId) return;
      if (isOverlaps(interview.startTime, interview.endTime, start, end)) {
        isAvailable = false;
      }
    });
    if (isAvailable && user.email) {
      availableUser.push(user.email);
    }
  }

  return {
    availableUser,
    message: "success",
  };
};

export const getUpcomingInterviews = async (): Promise<{
  interviews: LeanInterview[];
}> => {
  let interviews = await Interview.find({ startTime: { $gte: new Date() } })
    .lean<LeanInterview[]>()
    .exec();

  if (interviews.length === 0) interviews = [];

  for (const interview of interviews) {
    const participants: string[] = [];
    for (const participantId of interview.usersInvited as Types.ObjectId[]) {
      const participantEmail = await User.findById(participantId)
        .select("email -_id")
        .lean<{ email?: string } | null>()
        .exec();
      if (participantEmail?.email) {
        participants.push(participantEmail.email);
      }
    }
    (interview as unknown as { usersInvited: string[] }).usersInvited = participants;
  }

  return { interviews };
};

export const getInterviewById = async (
  interviewId: string
): Promise<{ interview: IInterview }> => {
  const interview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email -_id" })
    .lean<IInterview>()
    .exec();

  if (!interview) {
    throw new Error("Interview not found");
  }

  return { interview };
};

export const deleteInterviewById = async (
  interviewId: string
): Promise<{ message: string }> => {
  const interview = await Interview.findByIdAndDelete(interviewId).exec();

  if (!interview) {
    throw new Error("Interview not found");
  }

  return { message: "success" };
};

export const updateInterviewDetails = async ({
  interviewId,
  title,
  role,
  companyName,
  roleDescription,
  companyDescription,
  startTime,
  endTime,
  usersInvited,
}: UpdateInterviewInput): Promise<{ message: string }> => {
  if (!title || title.trim() === "") {
    throw new Error("Interview title is required");
  }
  if (!role || role.trim() === "") {
    throw new Error("Role is required");
  }
  if (!companyName || companyName.trim() === "") {
    throw new Error("Company name is required");
  }
  if (!roleDescription || roleDescription.trim() === "") {
    throw new Error("Role description is required");
  }
  if (!companyDescription || companyDescription.trim() === "") {
    throw new Error("Company description is required");
  }
  if (!startTime) {
    throw new Error("Start Time is not valid");
  }
  if (!endTime) {
    throw new Error("End Time is not valid");
  }
  if (!usersInvited) {
    throw new Error("usersInvited is not valid");
  }
  if (usersInvited.length <= 1) {
    throw new Error("Total users invited should be atleast ");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  ensureValidWindow(start, end);

  const users = await User.find({ email: { $in: usersInvited } })
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean<UserWithInterviews[]>()
    .exec();

  for (const user of users) {
    user?.interviewsScheduled?.forEach((interview) => {
      if (interview instanceof Types.ObjectId) return;
      if (
        interview._id.toString() !== interviewId &&
        isOverlaps(interview.startTime, interview.endTime, start, end)
      ) {
        throw new Error(
          `User, ${user.email} is already having an interview scheduled at this time. Please select another time.`
        );
      }
    });
  }

  const oldInterview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email" })
    .select("usersInvited")
    .lean<{ usersInvited: Array<{ _id: Types.ObjectId; email: string }> }>()
    .exec();

  if (!oldInterview) {
    throw new Error("Interview not found");
  }

  await Promise.all(
    oldInterview.usersInvited.map(async (user) => {
      if (!usersInvited.includes(user.email)) {
        await User.updateOne(
          { _id: user._id },
          { $pull: { interviewsScheduled: interviewId } },
          { new: true }
        );
      }
    })
  );

  await Promise.all(
    usersInvited.map(async (userEmail) => {
      await User.updateOne(
        { email: userEmail, interviewsScheduled: { $ne: interviewId } },
        { $addToSet: { interviewsScheduled: interviewId } }
      );
    })
  );

  const userIds: Types.ObjectId[] = [];
  for (const user of users) {
    userIds.push(user._id);
  }

  await Interview.updateOne(
    { _id: interviewId },
    {
      title: title.trim(),
      role: role.trim(),
      companyName: companyName.trim(),
      roleDescription: roleDescription.trim(),
      companyDescription: companyDescription.trim(),
      startTime: start,
      endTime: end,
      usersInvited: userIds,
    }
  );

  return { message: "Successfully updated." };
};

export const generateDescriptions = async ({
  companyName,
  role,
}: GenerateDescriptionsInput): Promise<GenerateDescriptionsOutput> => {
  if (!companyName || companyName.trim() === "") {
    throw new Error("Company name is required");
  }
  if (!role || role.trim() === "") {
    throw new Error("Role is required");
  }

  try {
    const descriptions = await generateBothDescriptions(
      companyName.trim(),
      role.trim()
    );

    return descriptions;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate descriptions");
  }
};

export default {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
  generateDescriptions,
};


