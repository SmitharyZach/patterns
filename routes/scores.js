const express = require("express");
const router = express.Router();
const db = require("../database/models");
router.use(express.json());

router.post("/pattern/:id/score", (req, res) => {
  db.score
    .create({
      score: true,
      pattern_id: 5,
      createdAt: new Date("3/5/2021"),
      updatedAt: new Date("3/5/2021"),
    })
    .then((score) => {
      return res.status(200).json(score);
    });
});

module.exports = router;
