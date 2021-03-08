const express = require("express");
const pbkdf2 = require("pbkdf2");
const crypto = require("crypto");
const session = require("express-session");
const router = express.Router();
const db = require("../database/models");
const { readdirSync } = require("fs");
router.use(express.json());

const encryptPassword = (word, pass_salt) => {
  let salt = pass_salt ? pass_salt : crypto.randomBytes(20).toString("hex");
  let password = word;
  let key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, "sha256");
  let hash = key.toString("hex");

  return `$${salt}$${hash}`;
};

const sessionChecker = (req, res, next) => {
  console.log(req.session.userid);
  if (!req.session.userid) {
    res.render("signup");
  } else {
    next();
  }
};

const findUser = async (name) =>
  await db.user
    .findOne({ where: { username: name } })
    .then(function (userData) {
      if (userData) {
        return userData.toJSON();
      } else {
        return null;
      }
    });

router.get("/signup", sessionChecker, (req, res) => {
  if (req.session.id) {
    res.redirect("/");
  }
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  // ensure all required fields are sent
  if (!req.body.username || !req.body.password) {
    return res.status(400).json("Must provide username and password");
  }

  // ensure all lower case usernames
  let user = req.body.username.toLowerCase();

  // make sure a user does not exist with that user name
  const findUserFirst = await findUser(user);
  if (findUserFirst) {
    return res.status(403).json("Username already taken");
  }

  // store encrypted password
  let pword = encryptPassword(req.body.password);
  db.user
    .create({
      username: user,
      password: pword,
    })
    .then((createdUser) => {
      let jsonUser = createdUser.toJSON();
      console.log("created user", jsonUser.id);
      req.session.userid = jsonUser.id;
      res.redirect("/");
    });
});

router.get("/login", sessionChecker, async (req, res) => {
  if (req.session.id) {
    res.redirect("/");
  }
  res.render("signup");
});
router.post("/login", async (req, res) => {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    return res.status(400).json("Must provide username and password");
  }
  const user = req.body.username.toLowerCase();
  const foundUser = await findUser(user);
  console.log("found user", foundUser);
  const pWord = foundUser.password;

  if (foundUser) {
    let pass_parts = pWord.split("$");
    let encryptedPass = encryptPassword(req.body.password, pass_parts[1]);
    if (encryptedPass == pWord) {
      req.session.userid = foundUser.id;
      res.redirect("/");
    } else {
      return res.status(400).json("Wrong Password");
    }
  } else {
    return res.status(400).json("No user found");
  }
});

router.get("/login/destroy", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
