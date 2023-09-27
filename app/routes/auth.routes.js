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
      verifySignUp.checkRolesExisted,
      verifySignUp.checkEmptyFields
    ],
    controller.signup
  );
  
  app.post(
    "/api/auth/changeUserEmail",
    [
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkCoindicenceWithOldPassword,
    ],
    controller.changeUserEmail
  );
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.post("/api/auth/refreshtoken", controller.refreshToken);
  app.post("/api/auth/sendMailTokenToResetPassword",tokenController.sendMailTokenToResetPassword);
  api.post("/resetPassword/:token",passwordController.resetPassword);
  app.post("/api/auth/updatePasswordViaEmail",passwordController.updatePasswordViaEmail);
  app.post("/api/auth/changePasswordViaSettings",passwordController.changePasswordViaSettings);
  app.post("/api/auth/findUserById", controller.findUserById);
  app.post("/api/auth/updateUserInformation", controller.updateUserInformation);
  app.post("/api/auth/getCurrentUser", controller.getCurrentUser);
  app.post("/api/auth/setUserProfilePicture", controller.setUserProfilePicture);
  app.post("/api/auth/getUsersForReport", controller.getUsersForReport);
};