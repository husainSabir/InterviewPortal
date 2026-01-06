const asyncHandler = require("express-async-handler");
const interviewUseCases = require("../usecases/interview");

const addInterview = asyncHandler(async (req, res) => {
  const { title, role, startTime, endTime, usersInvited } = req.body;

  try {
    const result = await interviewUseCases.addInterview({
      title,
      role,
      startTime,
      endTime,
      usersInvited,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    throw error;
  }
});

const getAvailableUsers = asyncHandler(async (req, res) => {
  const { startTime, endTime } = req.body;

  try {
    const result = await interviewUseCases.getAvailableUsers({
      startTime,
      endTime,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    throw error;
  }
});

const getUpcomingInterviews = asyncHandler(async (req, res) => {
  const result = await interviewUseCases.getUpcomingInterviews();
  res.status(200).json(result);
});

const getInterviewById = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const result = await interviewUseCases.getInterviewById(interviewId);
    res.status(200).json(result);
  } catch (error) {
    res.status(404);
    throw error;
  }
});

const deleteInterviewById = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const result = await interviewUseCases.deleteInterviewById(interviewId);
    res.status(200).json(result);
  } catch (error) {
    res.status(404);
    throw error;
  }
});

const updateInterviewDetails = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { title, role, startTime, endTime, usersInvited } = req.body;

  try {
    const result = await interviewUseCases.updateInterviewDetails({
      interviewId,
      title,
      role,
      startTime,
      endTime,
      usersInvited,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw error;
  }
});

module.exports = {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
};
