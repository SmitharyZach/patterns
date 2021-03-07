const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const app = express();
const port = 3000;
const db = require("./database/models");
const bodyParser = require("body-parser");
const signup = require("./routes/signup.js");
const patterns = require("./routes/patterns");
const scores = require("./routes/scores");

const findUserById = async (id) =>
  await db.user.findOne({ where: { id: id } }).then(function (userData) {
    return userData.toJSON();
  });

const findPattern = async (id) =>
  await db.pattern
    .findAll({
      where: {
        user_id: id,
      },
      include: {
        model: db.score,
      },
    })
    .then((results) => {
      let patterns = results.map((pattern) => pattern.toJSON());
      return patterns;
    });

const getDateWithOffset = (opp, offset) => {
  let d = new Date();
  if (!offset) {
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } else if (opp == "-") {
    let day = d.getDate() - offset;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } else {
    let day = d.getDate() + offset;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
};
const sessionChecker = (req, res, next) => {
  console.log(req.session.userid);
  if (!req.session.userid) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
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

app.use("/", signup);
app.use("/", patterns);
app.use("/", scores);

app.get("/", sessionChecker, async (req, res) => {
  const today = getDateWithOffset();
  const yesterday = getDateWithOffset("-", 1);
  const yesterday2 = getDateWithOffset("-", 2);
  const yesterday3 = getDateWithOffset("-", 3);
  const user = await findUserById(req.session.userid);
  const patterns = await findPattern(req.session.userid);
  console.log("patterns", patterns);
  console.log(user);
  res.render("user-landing", {
    layout: "userlayout",
    user: user,
    patterns: patterns,
    yesterday: yesterday,
    yesterday2: yesterday2,
    yesterday3: yesterday3,
    today: today,
  });
});

app.listen(port, () => {
  console.log("servin runnin WILD");
});
