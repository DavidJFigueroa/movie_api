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

// Get All Movies

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

// Get Movie by Title

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

// Get Data about a Genre

app.get("/genres/:Genre", (req, res) => {
  Movies.findOne({"Genre.Name": req.params.Genre})
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get Data about a Director

app.get("/directors/:Director", (req, res) => {
  Movies.findOne({"Director.Name": req.params.Director})
    .then((movie) => {
      res.status(201).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get List of all Users

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

// Get User by Name

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

// Allow User to register

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

// Allow user to update info

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
    {new: true}
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send("Error: No user was found");
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Allow user to deregister

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

// Add movie to favorite movies list

app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    {Username: req.params.Username},
    {
      $push: {FavoriteMovies: req.params.MovieID},
    },
    {new: true}).then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send("Error: User doesn't exist");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
    )
});

// Delete movie from favorite movies list

app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    {Username: req.params.Username},
    {
      $pull: {FavoriteMovies: req.params.MovieID},
    },
    {new: true}).then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send("Error: User doesn't exist");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
    )
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
