const express = require("express");
const cors = require("cors");
const initializeDBConnection = require("./config/db.connect")
const errorHandlerRoute = require("./middlewares/errorHandler");
const interviewRouter = require("./routers/interview");
const userRouter = require("./routers/user");

const importData = require("./seeder");


const app = express();

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

// app.get('*',(req,res) => {
//     res.send("hello");
// })


app.use(errorHandlerRoute.notFound);

app.use(errorHandlerRoute.errorHandler);

app.listen(8000, () => {
    console.log("server is up");
})