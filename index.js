const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// log all requests

app.use(morgan("combined", {stream: accessLogStream}));

// Serve static files from public folder

app.use(express.static("public"));

let = topMovies = [
  {
    title: "Ichi The Killer",
    author: "Takashi Miike",
  },
  {
    title: "Parasite",
    author: "Bong Joon-ho",
  },
];

app.get("/", (req, res) => {
  res.send("This will be the greatest movie API");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

// handling errors

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Whoopsie! Something is wrong!");
});

// listen for requests

app.listen(8080, () => {
  console.log("Your app is listening");
});
