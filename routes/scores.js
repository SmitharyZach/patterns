const express = require("express");
const router = express.Router();
const db = require("../database/models");
const { Op } = require("sequelize");
router.use(express.json());

const setDateFormat = (date) => {
  let d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  return `${year}-${month}-${day}`;
};

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
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

router.post("/pattern/score/delete", (req, res) => {
  // normalize dates
  let id = req.body.id;
  let today = new Date();
  let todayFormat = setDateFormat(today);
  console.log("todayformat", todayFormat);
  let morning = today.setHours(0, 0, 0, 1);
  let night = today.setHours(24, 0, 0, 0);
  console.log(morning, night);
  db.score
    .destroy({
      where: {
        [Op.and]: [
          {
            pattern_id: id,
          },
          {
            createdAt: {
              [Op.between]: [morning, night],
            },
          },
        ],
      },
    })
    .then((score) => {
      return res.status(200).json(score);
    })
    .catch((err) => {
      return res.status(401).json(err);
    });
});

module.exports = router;
