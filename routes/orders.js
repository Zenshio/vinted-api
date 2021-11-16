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
      product_name: req.fields.product_name,
      date: new Date(),
    };
    // Réception du token créer via l'API Stripe depuis le Frontend
    const stripeToken = req.fields.stripeToken;
    // Créer la transaction
    const response = await stripe.charges.create(
      Object.assign({ ...data }, { source: stripeToken })
    );
    console.log(response.status);

    // TODO
    // Sauvegarder la transaction dans une BDD MongoDB
    const order = new Order(data);
    offer.save();
    res.json(order);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
