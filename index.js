const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/flixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// log all requests

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.use(morgan("combined", {stream: accessLogStream}));

// Serve static files from public folder

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("This will be the greatest movie API");
});

app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/movies/:Title", (req, res) => {
  Movies.findOne({Title: req.params.Title})
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/genres/:Name", (req, res) => {
  Genres.findOne({Name: req.params.Name})
    .then((genre) => {
      res.json(genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/directors/:Name", (req, res) => {
  Directors.findOne({Name: req.params.Name})
    .then((director) => {
      res.status(201).json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/users/:Username", (req, res) => {
  Users.findOne({Username: req.params.Username})
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.post("/users", (req, res) => {
  Users.findOne({Username: req.body.Username})
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    {Username: req.params.Username},
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(error);
        res.status(500).send("Error: " + error);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

app.put("/users/:Username/favorites/:movieID", (req, res) => {
  Users.findOneAndUpdate(
    {FavoriteMovies: req.params.FavoriteMovies},
    {
      $set: {
        FavoriteMovies: req.body.FavoriteMovies,
      },
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(error);
        res.status(500).send("Error: " + error);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

app.delete("/users/:name/favorites/:movieID", (req, res) => {
  Users.findOneAndRemove({FavoriteMovies: req.params.FavoriteMovies})
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.FavoriteMovies + " was not found");
      } else {
        res.status(200).send(req.params.FavoriteMovies + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
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
