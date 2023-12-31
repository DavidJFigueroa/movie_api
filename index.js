/**
 * @module Movie API Calls
 * @description API Calls for Movie API
 */

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

mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((error) =>
    console.log("Database connection failed. Error message: ", error.message)
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}));

const cors = require("cors");
app.use(cors());

let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport.js");

// log all requests

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.use(morgan("combined", {stream: accessLogStream}));

/**
 *Serve static files from public folder
 */

app.get("/", (req, res) => {
  res.send("This will be the greatest movie API");
});

/**
 * @method Get all movies
 * @description Return a list of movies to the user
 * @name GET /movies
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: Array of JSON objects
 * [
 *   {
 *     "Title": "",
 *     "Description": "",
 *     "Genre": {
 *       "Name": "",
 *       "Description": "",
 *     },
 *     "Director": {
 *       "Name": "",
 *       "Bio": "",
 *     },
 *     "Actors": [""],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 * @param {authentication} - Bearer token (JWT)
 */

app.get(
  "/movies",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @method Get Single Movie
 * @description Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by name
 * @name GET /movies/[name]
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: A JSON object
 * [
 *   {
 *     "Title": "",
 *     "Description": "",
 *     "Genre": {
 *       "Name": "",
 *       "Description": "",
 *     },
 *     "Director": {
 *       "Name": "",
 *       "Bio": "",
 *     },
 *     "Actors": [""],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method Get Genre
 * @description Return data about a genre by name
 * @name GET /genres/[name]
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: A JSON object
 * [
 *   {
 *   "Genre": {
 *       "Name": "",
 *       "Description": "",
 *     }
 *    }
 * ]
 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method Get Director
 * @description Return data about a director by name
 * @name GET /directors/[name]
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: A JSON object
 * [
 *    {
 *    "Director": {
 *       "Name": "",
 *       "Bio": "",
 *       "Birth": "",
 *       "Death": "",
 *     }
 *     }
 * ]
 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 *  Get User by name after password authentication
 */

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

/**
 * @method Post Users
 * @description Allow new user to register
 * @name POST /users
 * @example
 * // Request data format
 *   [
 *     {
 *     "Username" : "",
 *     "Password" : "",
 *     "Email" : "",
 *     "Birthday" : ""
 *      }
 *   ]
 * @example
 * // Response data format: A JSON object holding data about the user that was added

 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method PUT Users
 * @description Allow new user to register
 * @name PUT /users/[name]
 * @example
 * // Request data format
 *   [
 *     {
 *     "Username" : "",
 *     "Password" : "",
 *     "Email" : "",
 *     "Birthday" : ""
*       }
*    ]
 * @example
 * // Response data format: A JSON object holding data about the user that was added

 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method DELETE Users
 * @description Allow new user to deregister
 * @name DELETE /users/[name]
 * @example
 * // Request data format
 * none
  
 * @example
 * // Response data format: JSON 

 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method PUT Movie to favorites
 * @description Allow  user to add a movie to their favorites
 * @name PUT /users/[name]/favorites/[movieID]	
 * @example
 * // Request data format
 * none
  
 * @example
 * // Response data format: JSON 

 * @param {authentication} - Bearer token (JWT)
 */

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

/**
 * @method DELETE Movie from favorites
 * @description Allow  user to remove a movie from their favorites
 * @name DELETE /users/[name]/favorites/[movieID]	
 * @example
 * // Request data format
 * none
  
 * @example
 * // Response data format: JSON 

 * @param {authentication} - Bearer token (JWT)
 */

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
  res.status(500).json({error: "Whoopsie! Something is wrong!"});
});

// listen for requests

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
