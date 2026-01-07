import { Router } from "express";
import { getAllUsersEmail } from "../controllers/user";

const router = Router();

router.get("/", getAllUsersEmail);

export default router;



