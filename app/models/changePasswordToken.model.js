const config = require("../config/passwordChange.config");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, Sequelize) => {
  const ChangePasswordToken = sequelize.define("changePasswordToken", {
    token: {
      type: Sequelize.STRING,
    },
    expiryDate: {
      type: Sequelize.DATE,
    },
  });
  ChangePasswordToken.createToken = async function (user) {
    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtExpiration);
    let _token =  jwt.sign({data:  user.email+config.dataSalt}, 'ourSecretKey', { expiresIn: config.jwtExpirationString });
    let changePasswordToken = await this.create({
      token: _token,
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    });
    return changePasswordToken;
  };
  ChangePasswordToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };
  return ChangePasswordToken;
};
