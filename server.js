const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const port = 3000;

app.use(express.json());

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

app.get("/", (req, res) => {
  console.log("hit homepage");
  res.render("homepage");
});

app.get("/login", (req, res) => {});

app.listen(port, () => {
  console.log("servin runnin WILD");
});
