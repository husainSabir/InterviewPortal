import mongoose from "mongoose";

const initializeDBConnection = async (): Promise<void> => {
  try {
    await mongoose.connect( process.env.DATABASE_URL || "mongodb://127.0.0.1:27017" );
    console.log("Connected To Database!");
  } catch (error) {
    console.error("Connection To Database failed.", error);
  }
};

export default initializeDBConnection;



