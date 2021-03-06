const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/Order");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/order/payment", isAuthenticated, async (req, res) => {
  try {
    const data = {
      amount: req.fields.amount,
      currency: req.fields.currency,
      description: req.fields.product_name,
    };
    // Réception du token créer via l'API Stripe depuis le Frontend
    const stripeToken = req.fields.stripeToken;
    // Créer la transaction
    const response = await stripe.charges.create(
      Object.assign(
        { ...data },
        { amount: Math.round(data.amount * 100), source: stripeToken }
      )
    );

    // Sauvegarder la transaction dans une BDD MongoDB
    const order = new Order(data);
    order.product_name = req.fields.product_name;
    order.owner = req.user;

    await order.save();
    res.json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
