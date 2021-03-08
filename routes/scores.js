const express = require("express");
const router = express.Router();
const db = require("../database/models");
router.use(express.json());

router.post("/pattern/score", (req, res) => {
  let id = req.body.id;
  db.score
    .create({
      score: true,
      pattern_id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .then((score) => {
      return res.status(200).json(score);
    });
});

module.exports = router;
