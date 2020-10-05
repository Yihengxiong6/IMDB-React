var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


/* ---- Q1a (Dashboard) ---- */
function getAllGenres(req, res) {
  let query = `
    SELECT DISTINCT genre
    FROM Genres;
  `;

  connection.query(query, function(err, rows) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
};


/* ---- Q1b (Dashboard) ---- */
function getTopInGenre(req, res) {

  let type = req.params.genre;
  console.log(type);
  let query = `
  SELECT title, rating, vote_count
  FROM Movies m JOIN Genres g ON m.id = g.movie_id
  WHERE g.genre = "${type}"
  ORDER BY m.rating DESC, m.vote_count DESC
  LIMIT 10;
  `
  connection.query(query, (err, row) => {
    if (err) console.log(err);
    else {
      res.json(row);
    }
  });
};

/* ---- Q2 (Recommendations) ---- */
function getRecs(req, res) {
  let name = req.params.name.replace(/_/g, ' ');
  let query = `
  WITH AG AS (
    SELECT g.genre
       FROM Movies m JOIN Genres g ON m.id = g.movie_id
       WHERE m.title = "${name}")
   SELECT m.title AS title, m.id AS id, m.rating AS rating, m.vote_count AS vote_count
   FROM movies m JOIN genres g ON m.id = g.movie_id, AG
   WHERE m.title != "${name}" AND g.genre IN (AG.genre)
   GROUP BY m.title, m.id
   HAVING COUNT(distinct g.genre) = (SELECT COUNT(*) FROM AG)
   ORDER BY m.rating DESC, m.vote_count DESC
   LIMIT 5;`;
  connection.query(query, (err, row) => {
    if (err) console.log(err);
    else {
      res.json(row);
    }
  })
};

/* ---- (Best Genres) ---- */
function getDecades(req, res) {
	var query = `
    SELECT DISTINCT (FLOOR(year/10)*10) AS decade
    FROM (
      SELECT DISTINCT release_year as year
      FROM Movies
      ORDER BY release_year
    ) y
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

/* ---- Q3 (Best Genres) ---- */
function bestGenresPerDecade(req, res) {
  let lb = parseInt(req.params.year);  // parse the string to int
  let ub = lb + 9;
  console.log(lb, ub);
  let query = `
  WITH D AS (
    SELECT m.title, m.rating, m.release_year, g.genre
       FROM Movies m JOIN Genres g ON m.id = g.movie_id
       WHERE m.release_year >= ${lb} AND m.release_year <= ${ub} ),
   AVEG AS (
   SELECT genre, AVG(rating) AS aveg
    FROM D
    GROUP BY genre)
   SELECT DISTINCT g.genre as genre, IFNULL(AVEG.aveg, 0) AS avg_rating
   FROM Genres g LEFT JOIN AVEG ON g.genre = AVEG.genre
   ORDER BY avg_rating DESC, genre;
  `
  connection.query(query, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      res.json(rows);
    }
  });
};

// The exported functions, which can be accessed in index.js.
module.exports = {
	getAllGenres: getAllGenres,
	getTopInGenre: getTopInGenre,
	getRecs: getRecs,
	getDecades: getDecades,
  bestGenresPerDecade: bestGenresPerDecade
}