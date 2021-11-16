const express = require("express");
const router = express.Router();

// const Order = require("../models/Order");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/order/payment", isAuthenticated, async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.fields.stripeToken;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: req.fields.amount,
    currency: req.fields.currency,
    description: req.fields.description,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

module.exports = router;
