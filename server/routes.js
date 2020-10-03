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
  ORDER BY m.rating DESC;
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

};

// The exported functions, which can be accessed in index.js.
module.exports = {
	getAllGenres: getAllGenres,
	getTopInGenre: getTopInGenre,
	getRecs: getRecs,
	getDecades: getDecades,
  bestGenresPerDecade: bestGenresPerDecade
}