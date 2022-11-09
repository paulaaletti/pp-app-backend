const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const tokenController = require("../controllers/token.controller")
const passwordController = require("../controllers/password.controller")

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.post("/api/auth/refreshtoken", controller.refreshToken);
  app.post("/api/auth/sendMailTokenToResetPassword",tokenController.sendMailTokenToResetPassword);
  app.post("/api/auth/updatePasswordViaEmail",passwordController.updatePasswordViaEmail);
  app.post("/api/auth/changePasswordViaSettings",passwordController.changePasswordViaSettings);
  app.post("/api/auth/findUserById", controller.findUserById);
};