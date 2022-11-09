const db = require("../models");
const bcrypt = require("bcryptjs");
const { user: User, changePasswordToken: ChangePasswordToken } = db;

const returnValidToken = async (aToken, res) =>{
    let changePasswordToken = await ChangePasswordToken.findOne({ where: { token: aToken } });
      if (!changePasswordToken) {
        res.status(403).json({ message: "El enlace para recuperar tu cuenta de Pata Pila es inválido." });
        return;
      }
      if (ChangePasswordToken.verifyExpiration(changePasswordToken)) {
        ChangePasswordToken.destroy({ where: { id: changePasswordToken.id } });   
        res.status(403).json({
          message: "El enlace para recuperar tu cuenta de Pata Pila ha expirado.",
        });
        return;
      }
      return changePasswordToken;
  };

exports.updatePasswordViaEmail = async(req, res) => {
    try{
      let receivedToken = req.body.token;
      let validToken = await returnValidToken(receivedToken, res);
      const user = await User.upsert({id: validToken.userId,password: bcrypt.hashSync(req.body.password, 8),});
  
    }catch (error) {
      res.status(500).send({ message: error.message });
    }
    res.status(200).send("Contraseña cambiada"); 
  };
  
exports.changePasswordViaSettings= async(req,res) => {
  User.findOne({
    where: {
      id: req.body.id
    }
  })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.oldpassword,
        user.password
      );
      if (passwordIsValid) {
        try{
          User.upsert({id: req.body.id,password: bcrypt.hashSync(req.body.password, 8),});
        }
        catch (error) {
          res.status(500).send({ message: err.message });
        }
        res.status(200).send({message: "La contraseña se ha cambiado exitosamente"})
      }
      else{
        res.status(500).send({message: "La contraseña antigua es incorrecta"});
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};