require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();
app.use(formidable());
//Utilisation du middleware morgan
app.use(morgan("dev"));

mongoose.connect(process.env.MONGODB_URI);

//import des routes
const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.json("All Routes");
});

app.listen(process.env.PORT, () => {
  console.log("Server has started !");
});
