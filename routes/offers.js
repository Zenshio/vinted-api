const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

// PUBLIER UNE OFFRE
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  if (!req.fields.title || req.fields.title.length > 50) {
    return res
      .status(400)
      .json({ message: "Title length must be between 0 and 50 characters." });
  } else if (!req.fields.description || req.fields.description.length > 500) {
    return res.status(400).json({
      message: "Description length must be between 0 and 500 characters.",
    });
  } else if (
    isNaN(req.fields.price) ||
    req.fields.price > 100000 ||
    req.fields.price < 0
  ) {
    return res.status(400).json({
      message: "Price must be between 0 and 100000.",
    });
  } else {
    try {
      const offer = new Offer({
        product_name: req.fields.title,
        product_description: req.fields.description,
        product_price: req.fields.price,
        product_details: [
          {
            MARQUE: req.fields.brand,
          },
          {
            TAILLE: req.fields.size,
          },
          {
            ÉTAT: req.fields.condition,
          },
          {
            COULEUR: req.fields.color,
          },
          {
            EMPLACEMENT: req.fields.city,
          },
        ],
        owner: req.user,
      });

      if (req.files.picture) {
        const pictureToUpload = req.files.picture.path;
        const picture = await cloudinary.uploader.upload(pictureToUpload, {
          folder: `vinted/offers/${offer.id}`,
        });

        if (picture) {
          offer.product_image = picture;
          await offer.save();
        }
      }

      return res.json(offer);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
});

// EDITER UNE OFFRE
router.put("/offer/edit", isAuthenticated, async (req, res) => {
  if (req.fields.title && req.fields.title.length > 50) {
    return res
      .status(400)
      .json({ message: "Title length must be between 0 and 50 characters." });
  } else if (req.fields.description && req.fields.description.length > 500) {
    return res.status(400).json({
      message: "Description length must be between 0 and 500 characters.",
    });
  } else if (
    req.fields.price &&
    (isNaN(req.fields.price) ||
      req.fields.price > 100000 ||
      req.fields.price < 0)
  ) {
    return res.status(400).json({
      message: "Price must be between 0 and 100000.",
    });
  } else {
    try {
      const offer = await Offer.findById(req.fields.id);

      if (!offer) {
        return res.status(400).json({ message: "Bad request." });
      } else {
        offer.product_name = req.fields.title;
        offer.product_description = req.fields.description;
        offer.product_price = req.fields.price;
        offer.product_details = [
          {
            MARQUE: req.fields.brand,
          },
          {
            TAILLE: req.fields.size,
          },
          {
            ÉTAT: req.fields.condition,
          },
          {
            COULEUR: req.fields.color,
          },
          {
            EMPLACEMENT: req.fields.city,
          },
        ];

        if (req.files.picture) {
          // On supprime ce qu'il y a dans le dossier
          await cloudinary.api.delete_resources_by_prefix(
            `vinted/offers/${req.fields.id}`
          );

          // Une fois le dossier vide, on peut le supprimer !
          await cloudinary.api.delete_folder(`vinted/offers/${req.fields.id}`);

          const pictureToUpload = req.files.picture.path;
          picture = await cloudinary.uploader.upload(pictureToUpload, {
            folder: `vinted/offers/${req.fields.id}`,
          });
          offer.product_image = picture;
        }
        await offer.save();
      }
      return res.json(offer);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
});

// SUPPRIMER UNE OFFRE
router.delete("/offer/cancel", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.id) {
      await Offer.findByIdAndDelete(req.fields.id);

      // On supprime ce qu'il y a dans le dossier
      await cloudinary.api.delete_resources_by_prefix(
        `vinted/offers/${req.fields.id}`
      );

      // Une fois le dossier vide, on peut le supprimer !
      await cloudinary.api.delete_folder(`vinted/offers/${req.fields.id}`);
      return res.json({ message: "Offer cancelled." });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  const filter = {};
  const sort = {};
  const resultsPerPage = req.query.results ? Number(req.query.results) : 20;

  if (req.query.title) {
    filter.product_name = new RegExp(req.query.title, "i");
  }

  if (req.query.priceMin || req.query.priceMax) {
    filter.product_price = {};
    if (req.query.priceMin) {
      filter.product_price["$gte"] = Number(req.query.priceMin);
    }

    if (req.query.priceMax) {
      filter.product_price["$lte"] = Number(req.query.priceMax);
    }
  }

  if (req.query.sort === "price-asc" || req.query.sort === "price-desc") {
    sort.product_price = req.query.sort.substring(6);
  }

  try {
    const offers = await Offer.find(filter)
      .select("product_name product_price")
      .sort(sort)
      .limit(resultsPerPage)
      .skip(req.query.page ? resultsPerPage * (req.query.page - 1) : 0);
    const count = await Offer.countDocuments(filter);

    return res.json({ count: count, data: offers });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: ["account", "email"],
    });
    return res.json(offer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
