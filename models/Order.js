const mongoose = require("mongoose");

const Order = mongoose.model("Order", {
  amount: Number,
  currency: String,
  product_name: String,
  date: { type: Date, default: Date.now() },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Order;
