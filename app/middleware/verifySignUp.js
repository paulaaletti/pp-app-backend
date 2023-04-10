const db = require("../models");
const ROLES = db.ROLES;
const bcrypt = require("bcryptjs");
const User = db.user;

checkDuplicateEmail = async (req, res, next) => {
    // Email
    user = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    if (user) {
      return res.status(400).send({
        message: "Ya existe una cuenta asociada a ese email!"
      });
    }
    next();
};
checkEmptyFields = (req, res, next) => {
  if (req.body.email == "" || req.body.password == "" || req.body.name == "" || req.body.lastname == "") {
    return res.status(400).send({
      message: "No puede haber campos vacíos!"
    });
  }
  next();
};
checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

checkCoindicenceWithOldPassword = async (req, res, next) => {
  user = await User.findOne({
    where: {
      id: req.body.userId,
    }
  });
  const passwordIsValid = bcrypt.compareSync(
    req.body.oldPassword,
    user.password
  );
  if (!passwordIsValid) {
    return res.status(400).send({
      message: "Contraseña Incorrecta. Debe ingresar su contraseña actual para poder cambiar su mail."
    });
  }
  next();
};

const verifySignUp = {
  checkDuplicateEmail,
  checkRolesExisted,
  checkEmptyFields,
  checkCoindicenceWithOldPassword
};
module.exports = verifySignUp;