import User from "../models/user";
import { UsersEmailResult } from "../types/user";

export const getAllUsersEmail = async (): Promise<UsersEmailResult> => {
  const users = await User.find({})
    .select("email -_id")
    .lean()
    .exec();

  return { users };
};


