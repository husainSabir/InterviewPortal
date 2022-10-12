const express = require("express");
const { getAllUsersEmail } = require("../controllers/user");

const router = express.Router();

router.get("/",getAllUsersEmail);

module.exports = router;
