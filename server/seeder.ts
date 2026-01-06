import User from "./models/user";
import Interview from "./models/interview";
import users from "./data/users";

const importData = async (): Promise<void> => {
  try {
    await User.deleteMany();
    await Interview.deleteMany();

    await User.insertMany(users);

    console.log("Data Imported!");
  } catch (error) {
    console.error(error);
  }
};

export default importData;


