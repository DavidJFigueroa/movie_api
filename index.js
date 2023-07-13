const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const {check, validationResult} = require("express-validator");

const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect("mongodb://localhost:27017/flixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connect(process.env.CONNECTION_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(
  "mongodb+srv://myflixDBadmin:ilikemovies666@myflixdb.c1fyxil.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}));

const cors = require("cors");
app.use(cors());

// let allowedOrigins = ["http://localhost:8080", "http://testsite.com"];

let allowedOrigins = ["*", "http://localhost:1234"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport.js");

// log all requests

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.use(morgan("combined", {stream: accessLogStream}));

// Serve static files from public folder

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

app.get(
  "/movies/:Title",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Movies.findOne({Title: req.params.Title})
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get Data about a Genre

app.get(
  "/genres/:Genre",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Movies.findOne({"Genre.Name": req.params.Genre})
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get Data about a Director

app.get(
  "/directors/:Director",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Movies.findOne({"Director.Name": req.params.Director})
      .then((movie) => {
        res.status(201).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get List of all Users

app.get(
  "/users",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get User by Name

app.get(
  "/users/:Username",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Users.findOne({Username: req.params.Username})
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Allow User to register

app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({min: 5}),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username: req.body.Username})
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);

// Allow user to update info

app.put(
  "/users/:Username",
  passport.authenticate("jwt", {session: false}),
  [
    check("Username", "Username is required").isLength({min: 5}),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      {Username: req.params.Username},
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
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
  }
);

// Allow user to deregister

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
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
  }
);

// Add movie to favorite movies list

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Users.findOneAndUpdate(
      {Username: req.params.Username},
      {
        $push: {FavoriteMovies: req.params.MovieID},
      },
      {new: true}
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User doesn't exist");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Delete movie from favorite movies list

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Users.findOneAndUpdate(
      {Username: req.params.Username},
      {
        $pull: {FavoriteMovies: req.params.MovieID},
      },
      {new: true}
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User doesn't exist");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// handling errors

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Whoopsie! Something is wrong!");
});

// listen for requests

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
