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
    return `${month}/${day}/${year}`;
  } else if (opp == "-") {
    let day = d.getDate() - offset;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${month}/${day}/${year}`;
  } else {
    let day = d.getDate() + offset;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
};

const getDateWithOffsetNoYear = (opp, offset) => {
  let d = new Date();
  if (!offset) {
    let day = d.getDate();
    let month = d.getMonth() + 1;
    return `${month}/${day}`;
  } else if (opp == "-") {
    let day = d.getDate() - offset;
    let month = d.getMonth() + 1;
    return `${month}/${day}`;
  } else {
    let day = d.getDate() + offset;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
};

const setDateFormat = (date) => {
  let d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();
  return `${month}/${day}/${year}`;
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
  const yesterday4 = getDateWithOffset("-", 4);
  const yesterday5 = getDateWithOffset("-", 5);
  const yesterday6 = getDateWithOffset("-", 6);

  const todayFormatted = getDateWithOffsetNoYear();
  const yesterdayFormatted = getDateWithOffsetNoYear("-", 1);
  const twoDaysAgoFormatted = getDateWithOffsetNoYear("-", 2);
  const threeDaysAgoFormatted = getDateWithOffsetNoYear("-", 3);
  const fourDaysAgoFormatted = getDateWithOffsetNoYear("-", 4);
  const fiveDaysAgoFormatted = getDateWithOffsetNoYear("-", 5);
  const sixDaysAgoFormatted = getDateWithOffsetNoYear("-", 6);

  const user = await findUserById(req.session.userid);
  const patterns = await findPattern(req.session.userid);

  patterns.forEach((pattern) => {
    pattern.dateObject = {
      today: false,
      yesterday: false,
      yesterday2: false,
      yesterday3: false,
      yesterday4: false,
      yesterday5: false,
      yesterday6: false,
    };
    pattern.scores.forEach((score) => {
      let createdAtDate = setDateFormat(score.createdAt);
      if (createdAtDate == today) {
        pattern.dateObject.today = true;
      } else if (createdAtDate == yesterday) {
        pattern.dateObject.yesterday = true;
      } else if (createdAtDate == yesterday2) {
        pattern.dateObject.yesterday2 = true;
      } else if (createdAtDate == yesterday3) {
        pattern.dateObject.yesterday3 = true;
      } else if (createdAtDate == yesterday4) {
        pattern.dateObject.yesterday4 = true;
      } else if (createdAtDate == yesterday5) {
        pattern.dateObject.yesterday5 = true;
      } else if (createdAtDate == yesterday6) {
        pattern.dateObject.yesterday6 = true;
      }
    });
  });

  res.render("user-landing", {
    layout: "userlayout",
    user: user,
    patterns: patterns,
    yesterday: yesterdayFormatted,
    yesterday2: twoDaysAgoFormatted,
    yesterday3: threeDaysAgoFormatted,
    yesterday4: fourDaysAgoFormatted,
    yesterday5: fiveDaysAgoFormatted,
    yesterday6: sixDaysAgoFormatted,
    today: todayFormatted,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("servin runnin WILD");
});
