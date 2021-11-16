const mongoose = require("mongoose");

const Order = mongoose.model("Order", {
  amount: Number,
  currency: String,
  product_name: String,
  date: Date,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Order;
