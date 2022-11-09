const multer = require('../middleware/multer.js')
const controller = require("../controllers/profilepicture.controller");
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
    app.post('/profile/picture/:id', multer.single('file'), controller.uploadProfilePicture)
    app.get('/profile/picture/:id', controller.getProfilePicture)

  };