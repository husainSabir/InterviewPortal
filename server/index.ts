import express, { Express } from "express";
import cors from "cors";
import initializeDBConnection from "./config/db.connect";
import { notFound, errorHandler } from "./middlewares/errorHandler";
import interviewRouter from "./routers/interview";
import userRouter from "./routers/user";
// import importData from "./seeder";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

initializeDBConnection();
// importData();

app.use("/api/interviews", interviewRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(8000, () => {
  console.log("server is up");
});



