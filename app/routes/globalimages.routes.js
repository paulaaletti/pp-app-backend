const controller = require("../controllers/milestone.controller");
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
      );
      next();
    });
    app.get('/milestone/picture/:id', controller.getMilestonePicture)

  };