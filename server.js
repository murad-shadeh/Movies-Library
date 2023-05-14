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
