const asyncHandler = require("express-async-handler");
const moment = require("moment");

const User = require("../models/user");
const Interview = require("../models/interview");
const isOverlaps = require("../utils/overlap");

const addInterview = asyncHandler(async (req, res) => {
  let { startTime, endTime, usersInvited } = req.body;

  let response = {status : 201, message : "Interview Added"};

  if (!startTime) {
    response.status = 400;
    response.message = "Start Time is not valid";
  }
  if (!endTime) {
    response.status = 400;
    response.message = "End Time is not valid";
  }
  if (!usersInvited) {
    response.status = 400;
    response.message = "User Invited is not valid";
  }

  // validations
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (endTime < startTime) {
    response.status = 400;
    response.message = "End Time cannot be before Start Time";
  }

  if (startTime < Date.now()) {
    response.status = 400;
    response.message = "Start Time cannot be before current time";
  }

  if (usersInvited.length <= 1) {
    response.status = 400;
    response.message = "Total users invited should be atleast 2";
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

  const url = req.protocol + "://" + req.get("host");

  const newInterview = {
    startTime,
    endTime,
    usersInvited: userIds,
  };


  // add new interview
  let interview = new Interview(newInterview);

  interview = await interview.save();

  // add this interview to all users
  for (let user of users) {
    await User.updateOne(
      { _id: user._id },
      { $push: { interviewsScheduled: interview._id } }
    );
  }

  res.status(response.status).json({
    message: response.message,
  });
});

const getAvailableUsers = asyncHandler(async (req, res) => {
  let { startTime, endTime} = req.body;

  
  let response = {status : 201, message : "success"};

  if (!startTime) {
    response.status = 400;
    response.message = "Start Time is not valid";
  }
  if (!endTime) {
    response.status = 400;
    response.message = "End Time is not valid";
  }

  // validations
  startTime = new Date(startTime);
  endTime = new Date(endTime);
 
  if (endTime < startTime) {
    response.status = 400;
    response.message = "End Time cannot be before Start Time";
  }

  if (startTime < Date.now()) {
    response.status = 400;
    response.message = "Start Time cannot be before current time";
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
    if(isAvailable){
      availableUser.push(user.email);
    }
  }

  res.status(response.status).json({
    availableUser : availableUser,
    message : response.message
  });
});




const getUpcomingInterviews = asyncHandler(async (req, res) => {
  let interviews = await Interview.find({ startTime: { $gte: new Date() } })
    .lean()
    .exec();

  // return empty array, if there are no upcoming interviews
  if (Object.keys(interviews).length === 0) interviews = [];

  for(let interview of interviews){
    let participants = [];
    for (let participantsid of interview.usersInvited){
      let participantEmail = await User.find({_id: participantsid}).select("email -_id").lean().exec();
      participants.push(participantEmail[0].email);
    }
    interview.usersInvited = participants;
  }
  res.status(200).json({
    interviews,
  });
});

const getInterviewById = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email -_id" })
    .lean()
    .exec();

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  res.status(200).json({ interview });
});

const deleteInterviewById = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const interview = await Interview.find({_id: interviewId})
    .remove()
    .exec();

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  res.status(200).json({ message : "success" });
});

const updateInterviewDetails = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  let { startTime, endTime, usersInvited } = req.body;

  if (!startTime) {
    res.status(400);
    throw new Error("Start Time is not valid");
  }
  if (!endTime) {
    res.status(400);
    throw new Error("End Time is not valid");
  }
  if (!usersInvited) {
    res.status(400);
    throw new Error("usersInvited is not valid");
  }

  // validations
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (endTime < startTime) {
    res.status(400);
    throw new Error("End Time cannot be before Start Time");
  }

  if (startTime < Date.now()) {
    res.status(400);
    throw new Error("Start Time cannot be before current time");
  }

  if (usersInvited.length <= 1) {
    res.status(400);
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
        res.status(400);
        throw new Error(
          `User, ${user.email} is already having an interview scheduled at this time. Please select another time.`
        );
      }
    });
  }

  // remove this interviewId from users which are no longer participants.
  const oldInterview = await Interview.findById(interviewId)
    .populate({ path: "usersInvited", model: "User", select: "email" })
    .select("usersInvited")
    .lean()
    .exec();
  const { usersInvited: oldUsersInvited } = oldInterview;

  oldUsersInvited.forEach(async (user) => {
    if (!usersInvited.includes(user.email)) {
      const updatedUser = await User.updateOne(
        { _id: user._id },
        { $pull: { interviewsScheduled: interviewId } },
        { new: true }
      );
    }
  });

  // add this interviewId to users
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

  // update interview
  await Interview.updateOne(
    { _id: interviewId },
    { startTime, endTime, usersInvited: userIds }
  );

  res.status(200).json({
    message: "Successfully updated.",
  });
});

module.exports = {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
};