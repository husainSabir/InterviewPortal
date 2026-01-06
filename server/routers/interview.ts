import { Router } from "express";
import {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
} from "../controllers/interview";

const router = Router();

router.post("/available", getAvailableUsers);
router.post("/", addInterview);
router.get("/upcoming", getUpcomingInterviews);
router.get("/:interviewId", getInterviewById);
router.delete("/:interviewId", deleteInterviewById);
router.put("/:interviewId", updateInterviewDetails);

export default router;


