const controller = require("../controllers/activities.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/activities/createActivity", controller.createActivity);
  app.post("/api/activities/getUserActivities", controller.getUserActivities);
  app.post("/api/activities/getUserLatesActivities", controller.getUserLatesActivities);
  app.post("/api/activities/createActivityType", controller.createActivityType);
};