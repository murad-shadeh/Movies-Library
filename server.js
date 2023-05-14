"use strict";
const express = require("express");
const cors = require("cors");
const axios = require("axios");
// import json data
const jsonData = require("./Movie Data/data.json");
require("dotenv").config();
// Require the postgres
const pg = require("pg");
// create new client from postgres that will connect to our database with db configuration
const client = new pg.Client(process.env.DB_URL);
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3005;
// Errors handling
const notFoundPage = (req, res) => {
  res.status(404).json({
    status: 404,
    responseText: "Page Not Found",
  });
};
const internalServerErrorPage = (err, req, res) => {
  res.status(500).json({
    code: 500,
    message: err.message || err,
  });
};
// First endpoint [Home Page]
const homeHandler = (req, res) => {
  //   console.log(`Testing the first URL`);
  //   res.status(200).json(data);
  jsonData.map(
    (item) =>
      new Add(
        item.id,
        item.title,
        item.release_date,
        item.poster_path,
        item.overview
      )
  );
  res.status(200).json(Add.newData);
};
app.get("/", homeHandler);
// second endpoint [Favourite]
const favoritesHandler = (req, res) => {
  console.log(`Welcome to Favorite Page`);
  res.status(200).json({
    statusCode: 200,
    message: "Welcome to Favorite Page",
  });
};
app.get("/favorite", favoritesHandler);
const trendingHandler = async (req, res) => {
  const data = await axios.get(
    `${process.env.TRENDING_URL}?api_key=${process.env.API_KEY}`
  );
  res.status(200).json({
    code: 200,
    message: data.data.results.map(
      (item) =>
        new Add(
          item.id,
          item.title,
          item.release_date,
          item.poster_path,
          item.overview
        )
    ),
  });
};
// new endpoint [trending]
app.get("/trending", trendingHandler);

const searchHandler = async (req, res) => {
  const queryVal = req.query.queryVal;
  console.log(queryVal);
  const data = await axios.get(
    `${process.env.SEARCH_URL_MOVIE}?api_key=${process.env.API_KEY}&language=en-US&query=${queryVal}&page=2`
  );
  res.status(200).json({
    code: 200,
    message: data.data.results.map(
      (item) =>
        new Add(
          item.id,
          item.title,
          item.release_date,
          item.poster_path,
          item.overview
        )
    ),
  });
};
// new endpoint [search]
app.get("/search", searchHandler);
const tvHandler = async (req, res) => {
  const data = await axios.get(
    `${process.env.TV_URL}/1?api_key=${process.env.API_KEY}&language=en-US`
  );
  res.status(200).json({
    code: 200,
    message: data.data,
  });
};
// NOTE => [tv and networks routes] don't include the properties inside the constructor
// so i can't map the data like the constructor function
// new endpoint [tv]
app.get("/tv", tvHandler);
const networksHandler = async (req, res) => {
  const data = await axios.get(
    `${process.env.NETWORKS_URL}/1?api_key=${process.env.API_KEY}`
  );
  res.status(200).json({
    code: 200,
    message: data.data,
  });
};
// new endpoint [networks]
app.get("/networks", networksHandler);
const addMovieHandler = async (req, res) => {
  const input = req.body;
  const sql = `INSERT INTO movie(title,release_date,poster_path,overview,comments) VALUES
   ('${input.title}','${input.release_date}','${input.poster_path}','${input.overview}','${input.comments}') returning *`;

  client
    .query(sql)
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      internalServerErrorPage(err, req, res);
    });
};
// addMovie endpoint [addMovie]
app.post("/addMovie", addMovieHandler);
const getMoviesHandler = (req, res) => {
  const sql = `SELECT * FROM movie `;
  // returning a promise
  client
    .query(sql)
    .then((data) => {
      res.status(200).json({
        count: data.count,
        data: data.rows,
      });
    })
    .catch((err) => {
      internalServerErrorPage(err, req, res);
    });
};
// get movies endpoint [getMovies]
app.get("/getMovies", getMoviesHandler);
const updateByIdHandler = (req, res) => {
  const id = req.params.id;
  const input = req.body;
  const updateValues = [input.comments, id];
  const sql = `UPDATE movie SET comments=$1 WHERE id =$2`;
  client
    .query(sql, updateValues)
    .then((data) => {
      res.status(202).json(data.rows);
    })
    .catch((err) => {
      internalServerErrorPage(err, req, res);
    });
};
// new endpoint [update by id]
app.put("/update/:id", updateByIdHandler);
const deleteByIdHandler = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM movie WHERE id = ${id}`;
  client
    .query(sql)
    .then(() => {
      res.status(204).json({
        code: 204,
        message: `Row deleted successfully with id ${id}`,
      });
    })
    .catch((err) => {
      internalServerErrorPage(err, req, res);
    });
};
// new endpoint [delete by id]
app.delete("/delete/:id", deleteByIdHandler);
const getMovieByIdHandler = (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM movie WHERE id = ${id}`;
  client
    .query(sql)
    .then((data) => {
      res.status(200).json(data.rows);
    })
    .catch((err) => {
      internalServerErrorPage(err, req, res);
    });
};
// new endpoint [get movie by id]
app.get("/getMovie/:id", getMovieByIdHandler);
// handle errors
app.use("*", notFoundPage);
app.use("*", internalServerErrorPage);
// constructor
function Add(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
  Add.newData.push(this);
}
Add.newData = [];

// if we're conneced show the following message
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Up and running on port ${PORT}`));
});
