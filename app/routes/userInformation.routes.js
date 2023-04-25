const controller = require("../controllers/userPersonalInformation.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/userInformation/updateUserPersonalInformation", controller.updateUserPersonalInformation);
  app.post("/api/userInformation/getUserPersonalInformation", controller.getUserPersonalInformation);
};