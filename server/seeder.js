const User = require("./models/user");
const Interview = require("./models/interview");
const users = require("./data/users");

const importData = async () => {
  try {
    await User.deleteMany();
    await Interview.deleteMany();

    await User.insertMany(users);

    console.log("Date Imported!");
  } catch (error) {
    console.error(error);
  }
};

module.exports = importData;