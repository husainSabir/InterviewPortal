const User = require("../models/user");
const Interview = require("../models/interview");
const isOverlaps = require("../utils/overlap");

const addInterview = async ({ title, role, startTime, endTime, usersInvited }) => {
  // Validations
  if (!title || title.trim() === "") {
    throw new Error("Interview title is required");
  }
  if (!role || role.trim() === "") {
    throw new Error("Role is required");
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

  // Convert to Date objects
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (endTime < startTime) {
    throw new Error("End Time cannot be before Start Time");
  }

  if (startTime < Date.now()) {
    throw new Error("Start Time cannot be before current time");
  }

  if (usersInvited.length <= 1) {
    throw new Error("Total users invited should be atleast 2");
  }

  const users = await User.find({ email: { $in: usersInvited } })
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean()
    .exec();

  const userIds = [];
  for (let user of users) {
    userIds.push(user._id);
  }

  const newInterview = {
    title: title.trim(),
    role: role.trim(),
    startTime,
    endTime,
    usersInvited: userIds,
  };

  // Add new interview
  let interview = new Interview(newInterview);
  interview = await interview.save();

  // Add this interview to all users
  for (let user of users) {
    await User.updateOne(
      { _id: user._id },
      { $push: { interviewsScheduled: interview._id } }
    );
  }

  return { message: "Interview Added" };
};

const getAvailableUsers = async ({ startTime, endTime }) => {
  if (!startTime) {
    throw new Error("Start Time is not valid");
  }
  if (!endTime) {
    throw new Error("End Time is not valid");
  }

  // Validations
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (endTime < startTime) {
    throw new Error("End Time cannot be before Start Time");
  }

  if (startTime < Date.now()) {
    throw new Error("Start Time cannot be before current time");
  }

  const users = await User.find({})
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean()
    .exec();

  // Compare time with all previous meetings of each user.
  let availableUser = [];
  for (let user of users) {
    let isAvailable = true;
    user?.interviewsScheduled.forEach((interview) => {
      if (
        isOverlaps(interview.startTime, interview.endTime, startTime, endTime)
      ) {
        isAvailable = false;
      }
    });
    if (isAvailable) {
      availableUser.push(user.email);
    }
  }

  return {
    availableUser,
    message: "success",
  };
};

const getUpcomingInterviews = async () => {
  let interviews = await Interview.find({ startTime: { $gte: new Date() } })
    .lean()
    .exec();

  // Return empty array, if there are no upcoming interviews
  if (Object.keys(interviews).length === 0) interviews = [];

  for (let interview of interviews) {
    let participants = [];
    for (let participantsid of interview.usersInvited) {
      let participantEmail = await User.find({ _id: participantsid })
        .select("email -_id")
        .lean()
        .exec();
      participants.push(participantEmail[0].email);
    }
    interview.usersInvited = participants;
  }

  return { interviews };
};

const getInterviewById = async (interviewId) => {
  const interview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email -_id" })
    .lean()
    .exec();

  if (!interview) {
    throw new Error("Interview not found");
  }

  return { interview };
};

const deleteInterviewById = async (interviewId) => {
  const interview = await Interview.findByIdAndDelete(interviewId).exec();

  if (!interview) {
    throw new Error("Interview not found");
  }

  return { message: "success" };
};

const updateInterviewDetails = async ({
  interviewId,
  title,
  role,
  startTime,
  endTime,
  usersInvited,
}) => {
  if (!title || title.trim() === "") {
    throw new Error("Interview title is required");
  }
  if (!role || role.trim() === "") {
    throw new Error("Role is required");
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

  // Validations
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (endTime < startTime) {
    throw new Error("End Time cannot be before Start Time");
  }

  if (startTime < Date.now()) {
    throw new Error("Start Time cannot be before current time");
  }

  if (usersInvited.length <= 1) {
    throw new Error("Total users invited should be atleast ");
  }

  const users = await User.find({ email: { $in: usersInvited } })
    .populate({
      path: "interviewsScheduled",
      model: "Interview",
      select: "startTime endTime",
    })
    .lean()
    .exec();

  // Compare time with all previous meetings of each user.
  // except, current interview.
  for (let user of users) {
    user?.interviewsScheduled.forEach((interview) => {
      if (
        interview._id.toString() !== interviewId &&
        isOverlaps(interview.startTime, interview.endTime, startTime, endTime)
      ) {
        throw new Error(
          `User, ${user.email} is already having an interview scheduled at this time. Please select another time.`
        );
      }
    });
  }

  // Remove this interviewId from users which are no longer participants.
  const oldInterview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email" })
    .select("usersInvited")
    .lean()
    .exec();

  if (!oldInterview) {
    throw new Error("Interview not found");
  }

  const { usersInvited: oldUsersInvited } = oldInterview;

  oldUsersInvited.forEach(async (user) => {
    if (!usersInvited.includes(user.email)) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { interviewsScheduled: interviewId } },
        { new: true }
      );
    }
  });

  // Add this interviewId to users
  usersInvited.forEach(async (userEmail) => {
    await User.updateOne(
      { email: userEmail, interviewsScheduled: { $ne: interviewId } },
      { $addToSet: { interviewsScheduled: interviewId } }
    );
  });

  const userIds = [];
  for (let user of users) {
    userIds.push(user._id);
  }

  // Update interview
  await Interview.updateOne(
    { _id: interviewId },
    { 
      title: title.trim(),
      role: role.trim(),
      startTime, 
      endTime, 
      usersInvited: userIds 
    }
  );

  return { message: "Successfully updated." };
};

module.exports = {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
};

