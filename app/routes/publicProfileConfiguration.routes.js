const controller = require("../controllers/publicProfileConfiguration.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/publicProfileConfig/updatePublicProfileConfiguration", controller.updatePublicProfileConfiguration);
  app.post("/api/publicProfileConfig/getPublicProfileConfiguration", controller.getPublicProfileConfiguration);
};