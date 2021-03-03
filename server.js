const express = require("express");
const handlebars = require("express-handlebars");
const pbkdf2 = require("pbkdf2");
const crypto = require("crypto");
const session = require("express-session");
const app = express();
const port = 3000;
const db = require("./database/models");

//password authentication

const encryptPassword = (word, pass_salt) => {
  let salt = pass_salt ? pass_salt : crypto.randomBytes(20).toString("hex");
  let password = word;
  let key = pbkdf2.pbkdf2Sync(password, salt, 36000, 256, "sha256");
  let hash = key.toString("hex");

  return `$${salt}$${hash}`;
};

const findUser = async (name) =>
  await db.user.findOne({ where: { username: name } });

const findUserById = async (id) => await db.user.findOne({ where: { id: id } });

const sessionChecker = (req, res, next) => {
  if (!req.session.id) {
    return res.json("Must be logged in to view page");
  } else {
    next();
  }
};

app.use(express.json());
app.use(
  session({
    secret: "tacoCat",
    resave: false,
    saveUninitialized: false,
    name: "qid",
    cookie: {
      maxAge: 60000000,
    },
  })
);
app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    layoutsDir: __dirname + "/views/layouts",
    extname: "hbs",
    defaultLayout: "index",
    partialsDir: __dirname + "/views/partials",
  })
);

app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res) => {
  const user = await findUserById(req.session.id);

  const patterns = await db.pattern.findAll({
    where: {
      user_id: user.id,
    },
    include: {
      model: db.score,
    },
  });
  return res.status(200).json({ user, patterns });
});

app.post("/login", async (req, res) => {
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
      req.session.id = foundUser.id;
      console.log(session);
      return res.json(`Correct password! welcome ${user}`);
    } else {
      return res.status(400).json("Wrong Password");
    }
  } else {
    return res.status(400).json("No user found");
  }
});

app.post("/signup", async (req, res) => {
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
      return res.json(user);
    });
});

app.listen(port, () => {
  console.log("servin runnin WILD");
});
