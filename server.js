const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const app = express();
const port = 3000;
const db = require("./database/models");
const bodyParser = require("body-parser");
const signup = require("./routes/signup.js");

const findUserById = async (id) => await db.user.findOne({ where: { id: id } });

const sessionChecker = (req, res, next) => {
  console.log(req.session.userid);
  if (!req.session.userid) {
    res.render("signup", {
      title: "Log in",
      route: "login",
      message: "Want to join Patterns?",
      reverseRoute: "signup",
      reverseTitle: "Sign up",
    });
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
app.get("/", sessionChecker, async (req, res) => {
  const user = await findUserById(req.session.userid);
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

// create pattern
app.post("/pattern", (req, res) => {
  //TODO change user ID to grab from session

  if (!req.body.name || !req.body.description) {
    return res.status(400).json("Must provide name and description");
  }
  let pattern = req.body;

  db.pattern
    .create(pattern)
    .then((newPattern) => res.status(200).json(newPattern))
    .catch((err) => {
      res.status(400).json(err);
    });
});

// delete pattern
app.delete("/pattern", (req, res) => {
  // delete post by id
  db.pattern
    .destroy({
      where: {
        id: req.body.id,
      },
    })
    .then((data) => {
      res.status(200).json("Successful deletion!");
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
app.listen(port, () => {
  console.log("servin runnin WILD");
});
