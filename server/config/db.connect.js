const mongoose = require("mongoose");

const initializeDBConnection = () => {
  mongoose
    // eslint-disable-next-line no-undef
    .connect("mongodb://127.0.0.1:27017", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => console.log("Connected To Database!"))
    .catch((error) => console.error("Connection To Database failed.", error));
};

module.exports = initializeDBConnection;