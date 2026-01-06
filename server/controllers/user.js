const asyncHandler = require("express-async-handler");
const userUseCases = require("../usecases/user");

const getAllUsersEmail = asyncHandler(async (req, res) => {
  try {
    const result = await userUseCases.getAllUsersEmail();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error.",
    });
  }
});

module.exports = { getAllUsersEmail };
