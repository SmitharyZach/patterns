const express = require("express");
const router = express.Router();
const db = require("../database/models");
router.use(express.json());

// create pattern
router.post("/patterns", (req, res) => {
  //TODO change user ID to grab from session
  let user = req.session.userid;
  console.log(req.body);

  if (!req.body.name || !req.body.description) {
    return res.status(400).json("Must provide name and description");
  }
  let pattern = req.body;
  pattern.user_id = user;

  db.pattern
    .create(pattern)
    .then((newPattern) => res.redirect("/"))
    .catch((err) => {
      res.status(400).json(err);
    });
});

// delete pattern
router.post("/pattern", (req, res) => {
  // delete post by id
  db.pattern
    .destroy({
      where: {
        id: req.body.id,
      },
    })
    .then((data) => {
      return res.status(200).json("Successful deletion!");
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

module.exports = router;
