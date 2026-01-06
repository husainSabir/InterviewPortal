import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addInterview as addInterviewUseCase,
  getAvailableUsers as getAvailableUsersUseCase,
  getUpcomingInterviews as getUpcomingInterviewsUseCase,
  getInterviewById as getInterviewByIdUseCase,
  deleteInterviewById as deleteInterviewByIdUseCase,
  updateInterviewDetails as updateInterviewDetailsUseCase,
} from "../usecases/interview";
import { AddInterviewInput, UpdateInterviewInput } from "../types/interview";

type AddInterviewRequest = Request<unknown, unknown, AddInterviewInput>;
type GetAvailableUsersRequest = Request<
  unknown,
  unknown,
  Pick<AddInterviewInput, "startTime" | "endTime">
>;
type UpdateInterviewRequest = Request<
  { interviewId: string },
  unknown,
  Omit<UpdateInterviewInput, "interviewId">
>;

export const addInterview = asyncHandler(
  async (req: AddInterviewRequest, res: Response) => {
    const { title, role, startTime, endTime, usersInvited } = req.body;

    try {
      const result = await addInterviewUseCase({
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
  }
);

export const getAvailableUsers = asyncHandler(
  async (req: GetAvailableUsersRequest, res: Response) => {
    const { startTime, endTime } = req.body;

    try {
      const result = await getAvailableUsersUseCase({
        startTime,
        endTime,
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(400);
      throw error;
    }
  }
);

export const getUpcomingInterviews = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getUpcomingInterviewsUseCase();
    res.status(200).json(result);
  }
);

export const getInterviewById = asyncHandler(
  async (req: Request<{ interviewId: string }>, res: Response) => {
    const { interviewId } = req.params;

    try {
      const result = await getInterviewByIdUseCase(interviewId);
      res.status(200).json(result);
    } catch (error) {
      res.status(404);
      throw error;
    }
  }
);

export const deleteInterviewById = asyncHandler(
  async (req: Request<{ interviewId: string }>, res: Response) => {
    const { interviewId } = req.params;

    try {
      const result = await deleteInterviewByIdUseCase(interviewId);
      res.status(200).json(result);
    } catch (error) {
      res.status(404);
      throw error;
    }
  }
);

export const updateInterviewDetails = asyncHandler(
  async (req: UpdateInterviewRequest, res: Response) => {
    const { interviewId } = req.params;
    const { title, role, startTime, endTime, usersInvited } = req.body;

    try {
      const result = await updateInterviewDetailsUseCase({
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
  }
);

export default {
  addInterview,
  getAvailableUsers,
  getUpcomingInterviews,
  getInterviewById,
  deleteInterviewById,
  updateInterviewDetails,
};


