const controller = require("../controllers/publicProfileInformation.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/publicProfile/updatePublicProfileInformation", controller.updatePublicProfileInformation);
  app.post("/api/publicProfile/getPublicProfileInformation", controller.getPublicProfileInformation);
};