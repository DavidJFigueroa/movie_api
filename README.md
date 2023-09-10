# Movie API Documentation

The Movie API is a RESTful API created with MongoDB as the database and hosted on Heroku. It provides various endpoints to interact with movie data, user registration, and user favorites. This documentation outlines the available resources, their URLs, supported HTTP methods, and request and response formats.

## Resource Information

| Business Logic                                    | URL                                 | HTTP Method | Request Body Data Format | Response Body Data Format                       |
| ------------------------------------------------- | ----------------------------------- | ----------- | ------------------------ | ----------------------------------------------- |
| Return a list of movies to the user               | `/movies`                           | GET         | None                     | JSON object holding data about movies           |
| Return data about a single movie by name          | `/movies/[name]`                    | GET         | None                     | JSON object holding data about the movie        |
| Return data about a genre by name                 | `/genres/[name]`                    | GET         | None                     | JSON object holding data about the genre        |
| Return data about a director by name              | `/directors/[name]`                 | GET         | None                     | JSON object holding data about the director     |
| Allow new user to register                        | `/users`                            | POST        | JSON                     | JSON object holding data about the user added   |
| Allow user to update their info (username)        | `/users/[name]`                     | PUT         | JSON                     | JSON object holding data about the updated user |
| Allow user to add a movie to their favorites      | `/users/[name]/favorites/[movieID]` | PUT         | None                     | JSON                                            |
| Allow user to remove a movie from their favorites | `/users/[name]/favorites/[movieID]` | DELETE      | None                     | JSON                                            |
| Allow user to deregister                          | `/users/[name]`                     | DELETE      | None                     | JSON                                            |

## Endpoints

### Return a list of movies to the user

**URL**: `/movies`

**HTTP Method**: GET

**Request Body Data Format**: None

**Response Body Data Format**:

```json
{
  "movies": [
    {
      "_id": "649598dc844b0d20893f1860",
      "Title": "Silence of the Lambs",
      "Description": "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
      "Genre": {
        "Name": "Thriller",
        "Description": "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience."
      },
      "Director": {
        "Name": "Jonathan Demme",
        "Bio": "Jonathan Demme was born on 22 February 1944 in Baldwin, Long Island, New York, USA. He was a director and producer, known for The Silence of the Lambs (1991), Rachel Getting Married (2008) and Philadelphia (1993). He was previously married to Joanne Howard and Evelyn Purcell. He died on 26 April 2017 in Manhattan, New York City, New York, USA.",
        "Birth": "1944",
        "Death": "2017"
      },
      "ImagePath": "silenceofthelambs.png",
      "Featured": true
    }
    // Additional movie objects...
  ]
}
```

### Return data about a single movie by name

**URL**: `/movies/[name]`

**HTTP Method**: GET

**Request Body Data Format**: None

**Response Body Data Format**:

```json
{
  "movie": {
    "_id": "649598dc844b0d20893f1860",
    "Title": "Silence of the Lambs",
    "Description": "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
    "Genre": {
      "Name": "Thriller",
      "Description": "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience."
    },
    "Director": {
      "Name": "Jonathan Demme",
      "Bio": "Jonathan Demme was born on 22 February 1944 in Baldwin, Long Island, New York, USA. He was a director and producer, known for The Silence of the Lambs (1991), Rachel Getting Married (2008) and Philadelphia (1993). He was previously married to Joanne Howard and Evelyn Purcell. He died on 26 April 2017 in Manhattan, New York City, New York, USA.",
      "Birth": "1944",
      "Death": "2017"
    },
    "ImagePath": "silenceofthelambs.png",
    "Featured": true
  }
}
```

### Return data about a genre by name

**URL**: `/genres/[name]`

**HTTP Method**: GET

**Request Body Data Format**: None

**Response Body Data Format**:

```json
{
  "Genre": {
    "Name": "Thriller",
    "Description": "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience."
  }
}
```

### Return data about a director by name

**URL**: `/directors/[name]`

**HTTP Method**: GET

**Request Body Data Format**: None

**Response Body Data Format**:

```json
{
  "Name": "Alfred Hitchcock",
  "Bio": "Alfred Hitchcock was an English director and filmmaker. Popularly known as the 'Master of Suspense' for his use of innovative film techniques in thrillers",
  "Birth": "1899",
  "Death": "1980"
}
```

### Allow new user to register

**URL**: `/users`

**HTTP Method**: POST

**Request Body Data Format**:

```json
{
  "Username": "Shark",
  "Password": "waterworld999",
  "Email": "shark@blub.com",
  "Birthday": "1970-11-08"
}
```

**Response Body Data Format**:

```json
{
  "User": {
    "Username": "Shark",
    "Email": "shark@blub.com",
    "Birthday": "1970-11-08"
  }
}
```

### Allow user to update their info (username)

**URL**: `/users/[name]`

**HTTP Method**: PUT

**Request Body Data Format**:

```json
{
  "Password": "waterworld888"
}
```

**Response Body Data Format**:

```json
{
  "User": {
    "Username": "Shark",
    "Email": "shark@blub.com",
    "Birthday": "1970-11-08"
  }
}
```

### Allow user to add a movie to their favorites

**URL**: `/users/[name]/favorites/[movieID]`

**HTTP Method**: PUT

**Request Body Data Format**: None

### Allow user to remove a movie from their favorites

**URL**: `/users/[name]/favorites/[movieID]`

**HTTP Method**: DELETE

**Request Body Data Format**: None

### Allow user to deregister

**URL**: `/users/[name]`

\*\*HTTP
