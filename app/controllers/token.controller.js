const emailConfig = require("../config/email.config");
var nodemailer = require('nodemailer');
const db = require("../models");
const { user: User, changePasswordToken: ChangePasswordToken } = db;

const manageTokenCreationFor = async (user) =>{
  let changePasswordToken = await ChangePasswordToken.findOne({ where: { userId: user.id } });
  if (!changePasswordToken) {
    changePasswordToken = await ChangePasswordToken.createToken(user);
  }else if (ChangePasswordToken.verifyExpiration(changePasswordToken)) {
    ChangePasswordToken.destroy({ where: { id: changePasswordToken.id } });
    changePasswordToken = await ChangePasswordToken.createToken(user);    
  }
  return changePasswordToken;
};

const configureMail = async (user, aToken) =>{
  var mailOptions = {
    from: emailConfig.transporterAuth.user,
    to: user.email,
    subject: emailConfig.subject,    
    // This would be the text of email body
    html: `<div><p style="color:#0F6938;font-size:18px">Hola ${user.name} ${user.lastname}!<p>
            <p style="font-size:14px;color:#353330">Para poder resetear tu contraseña primero debemos verificar tu email,
            para completar este proceso solo deber hacer click en
            <a style="font-size:14px" href="http://localhost:3000/resetPassword/${aToken.token}">este enlace</a>
            <span style="font-size:14px;color:#353330">Este link verificara tu identidad y te permitira cambiar tu contraseña</span>
            <p></p>
            <p style="font-size:14px;color:#353330">Saludos, Pata Pila</p>
            </div>`
    
    };
    return mailOptions;
};


const transporter = nodemailer.createTransport({
    service: emailConfig.transporterService,
    auth: emailConfig.transporterAuth,
});

exports.sendMailTokenToResetPassword = (req, res) => {
  User.findOne({where: { email: req.body.email}})
  .then(async (user) => {
    if (!user) {
      return res.status(404).send({ message: "El mail ingresado no se encuentra registrado en Pata Pila." });
    }  

    let changePasswordToken = await manageTokenCreationFor(user);
    let mailOptions = await configureMail(user,changePasswordToken);
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email enviado: ' + info.response);
      }
    }); 
    res.status(200).send("mail ok");
  })
};


