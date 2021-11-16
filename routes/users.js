const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    if (req.fields.username) {
      const existingUser = await User.findOne({ email: req.fields.email });
      if (!existingUser) {
        const password = req.fields.password;
        const salt = uid2(16);

        const user = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: uid2(16),
          hash: SHA256(password + salt).toString(encBase64),
          salt: salt,
        });

        if (req.files.picture) {
          const pictureToUpload = req.files.picture.path;
          const picture = await cloudinary.uploader.upload(pictureToUpload, {
            folder: `vinted/users/${user.id}`,
          });

          if (picture) {
            user.account.avatar = picture;
          }
          await user.save();
        }
        return res.json({
          _id: user._id,
          email: user.email,
          account: user.account,
          token: user.token,
        });
      } else {
        return res.status(400).json({ error: "Email already in use." });
      }
    } else {
      return res.status(400).json({ error: "Username required." });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (
      user &&
      SHA256(req.fields.password + user.salt).toString(encBase64) === user.hash
    ) {
      user.token = uid2(16);
      await user.save();
      return res.json({
        _id: user._id,
        email: user.email,
        account: user.account,
        token: user.token,
      });
    } else {
      return res.status(401).json({ error: "Wrong email or password." });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
