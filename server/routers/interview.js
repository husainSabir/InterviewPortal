const express = require("express");
const {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
} = require("../controllers/interview");

const router = express.Router();

router.post("/available", getAvailableUsers);
router.post("/", addInterview);
router.get("/upcoming", getUpcomingInterviews);
router.get("/:interviewId", getInterviewById);
router.delete("/:interviewId", deleteInterviewById);
router.put("/:interviewId",updateInterviewDetails);


module.exports = router;