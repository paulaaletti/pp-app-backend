const controller = require("../controllers/milestones.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/milestone/createMilestone", controller.createMilestone);
  app.post("/api/milestone/addImageToMilestone", controller.addImageToMilestone);
  app.post("/api/milestone/getUserWithMilestones", controller.getUserWithMilestones);
};