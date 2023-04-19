const controller = require("../controllers/publicProfileURL.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/publicProfileURL/getUserPublicProfileURL", controller.getPublicProfileURL);
  app.post("/api/publicProfileURL/createPublicProfileURL", controller.createPublicProfileURL)
};