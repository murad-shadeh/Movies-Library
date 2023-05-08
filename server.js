"use strict";
const express = require("express");
const cors = require("cors");
const axios = require("axios");
// import json data
const jsonData = require("./Movie Data/data.json");
require("dotenv").config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3005;
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
// test internal server error
app.get("/error", (req, res) => res.send(error()));
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
  const data = await axios.get(
    `${process.env.SEARCH_URL_MOVIE}?api_key=${process.env.API_KEY}&language=en-US&query=movie&page=1&include_adult=false`
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
// Errors handling
const notFoundPage = (req, res) => {
  res.status(404).json({
    status: 404,
    responseText: "Page Not Found",
  });
};
const internalServerErrorPage = (err, req, res) => {
  console.log(err.stack);
  res.status(500).json({
    status: 500,
    message: err,
  });
};
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
app.listen(PORT, () => console.log(`Up and running on port ${PORT}`));
