const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

async function dbConnection() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("3001");
    });
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
}
dbConnection();

const convertMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API-1
app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT
      *
    FROM
      movie;`;
  const moviesArray = await db.all(getMovies);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// Api - 2;
app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addMovie = `
    INSERT INTO
         movie(director_id,movie_name,lead_actor)
    VALUES(
         ${directorId},
        '${movieName}',
        '${leadActor}');`;
  console.log(addMovie);
  const dbResponse = await db.run(addMovie);
  response.send("Movie Successfully Added");
});

// API-3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  console.log(getMovie);
  const dbResponse = await db.get(getMovie);
  response.send(convertMovieObjectToResponseObject(dbResponse));
});

// API-4
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
    UPDATE 
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';`;
  const dbResponse = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM 
        movie
    WHERE
        movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteMovie);
  response.send("Movie Removed");
});

// API-6
app.get("/directors/", async (request, response) => {
  const getDirectors = `
        SELECT
            *
        FROM
            director;`;
  const dbResponse = await db.all(getDirectors);
  response.send(
    dbResponse.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

// APi-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesDirected = `
    SELECT 
        * 
    FROM
        movie
    WHERE
        director_id = ${directorId};`;
  const dbResponse = await db.all(getMoviesDirected);
  console.log(dbResponse);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
