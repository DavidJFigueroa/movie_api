const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// log all requests

app.use(morgan("combined", {stream: accessLogStream}));
app.use(bodyParser.json());

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

app.get("/movies/:name", (req, res) => {
  res.send("Successful GET request returning data of a movie by name");
});

app.get("/genres/:name", (req, res) => {
  res.send("Successful GET request returning data of a genre by name");
});

app.get("/directors/:name", (req, res) => {
  res.send("Successful GET request returning data of a director by name");
});

app.post("/users", (req, res) => {
  res.send("Successful POST request for users to register");
});

app.put("/users/:name", (req, res) => {
  res.send("Successful PUT request for users to update their info");
});

app.put("/users/:name/favorites", (req, res) => {
  res.send(
    "Successful PUT request for users to add movies to their favorite list"
  );
});

app.delete("/users/:name/favorites", (req, res) => {
  res.send(
    "Successful PUT request for users to remove movies from their favorite list"
  );
});

app.delete("/users", (req, res) => {
  res.send("Successful DELETE request for users to deregister");
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
