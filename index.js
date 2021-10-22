require("dotenv").config();

const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(formidable());
//Utilisation du middleware morgan
app.use(morgan("dev"));

mongoose.connect(process.env.MONGODB_URI);

//import des routes
const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json("Welcome here ;)");
});

app.all("*", (req, res) => {
  res.json("All Routes");
});

app.listen(process.env.PORT, () => {
  console.log("Server has started !");
});
