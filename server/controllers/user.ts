import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAllUsersEmail as getUsersEmail } from "../usecases/user";

export const getAllUsersEmail = asyncHandler(
  async (_req: Request, res: Response) => {
    try {
      const result = await getUsersEmail();
      res.status(200).json(result);
    } catch (_err) {
      res.status(500).json({
        message: "Internal server error.",
      });
    }
  }
);

export default {
  getAllUsersEmail,
};



