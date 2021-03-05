const express = require("express");
const pbkdf2 = require("pbkdf2");
const crypto = require("crypto");
const session = require("express-session");
const router = express.Router();
const db = require("../database/models");
router.use(express.json());

const encryptPassword = (word, pass_salt) => {
  let salt = pass_salt ? pass_salt : crypto.randomBytes(20).toString("hex");
  let password = word;
  let key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, "sha256");
  let hash = key.toString("hex");

  return `$${salt}$${hash}`;
};

const findUser = async (name) =>
  await db.user.findOne({ where: { username: name } });

router.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Sign up",
    route: "signup",
    message: "Already a member?",
    reverseRoute: "login",
    reverseTitle: "Log in",
  });
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
    .then((user) => {
      req.session.userid = foundUser.id;
      return res.json(user);
    });
});

router.get("/login", (req, res) => {
  res.render("signup", {
    title: "Log in",
    route: "login",
    message: "Want to join Patterns?",
    reverseRoute: "signup",
    reverseTitle: "Sign up",
  });
});
router.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json("Must provide username and password");
  }
  const user = req.body.username.toLowerCase();
  const foundUser = await findUser(user);
  const pWord = foundUser.password;

  if (foundUser) {
    let pass_parts = pWord.split("$");
    let encryptedPass = encryptPassword(req.body.password, pass_parts[1]);
    if (encryptedPass == pWord) {
      req.session.userid = foundUser.id;
      console.log(session);
      return res.json(`Correct password! welcome ${user}`);
    } else {
      return res.status(400).json("Wrong Password");
    }
  } else {
    return res.status(400).json("No user found");
  }
});

module.exports = router;
