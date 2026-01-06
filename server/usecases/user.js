const User = require("../models/user");

const getAllUsersEmail = async () => {
  const users = await User.find({}).select("email -_id").lean().exec();
  return { users };
};

module.exports = {
  getAllUsersEmail,
};

