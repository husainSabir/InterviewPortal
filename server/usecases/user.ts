import User from "../models/user";
import { GetAllUsersEmailResult } from "../types/user";

export const getAllUsersEmail = async (): Promise<GetAllUsersEmailResult> => {
  const users = await User.find({})
    .select("email -_id")
    .lean()
    .exec();

  return { users };
};


