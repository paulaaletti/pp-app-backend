const db = require("../models");
const { userPersonalInformation: UserPersonalInformation} = db;

exports.updateUserPersonalInformation = async (req, res) => {
  UserPersonalInformation.findOne({
    where: {
      userId: req.body.userId,
    },
  })
  .then(async (userInfo) => {
    if (userInfo) {
      UserPersonalInformation.update({
        city: req.body.city,
        country: req.body.country,
        address: req.body.address,
        dateOfBirth:  req.body.dateOfBirth,
        phoneNumber: req.body.phoneNumber,  
      }, {
        where: {
          id: userInfo.id,
        },
      })
      .then(async (user) => {
        if (user) {
          res.status(200).send(user);
        }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
        res.status(200).send({message: "La informacion personal del usuario se ha cambiado exitosamente"})
      }else{
        res.status(404).send({ message: "User Personal Information not found." });
      }
    });
};

  exports.getUserPersonalInformation = async (req, res) => {
    UserPersonalInformation.findOne({
      where: {
        userId: req.body.userId,
      },
    })
      .then(async (userInfo) => {
        console.log(userInfo.id)
        res.status(200).send(userInfo);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };

