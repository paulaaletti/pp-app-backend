const db = require("../models");
const { userPersonalInformation: UserPersonalInformation} = db;

exports.updateUserPersonalInformation = async (req, res) => {
  UserPersonalInformation.findOne({
    where: {
    },
  })
  .then(async (userInfo) => {
    if (userInfo) {
      UserPersonalInformation.update({
        city: req.body.city,
        country: req.body.country,
        address: req.body.address,
        dateOfBirth:  req.body.dateOfBirth,
        biography: req.body.biography,
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
    }else{
      try {
        const userInfo = await UserPersonalInformation.create({
          city: req.body.city,
          country: req.body.country,
          address: req.body.address,
          dateOfBirth:  req.body.dateOfBirth,
          biography: req.body.biography,
          phoneNumber: req.body.phoneNumber,  
          userId: req.body.userId,
        });
        if (!userInfo) {
          return res.status(500).send({ message: "Error creating user personal information" });
        };
        res.send({ message: "User personal information created successfully!" });
      } catch (error) {
        res.status(500).send({ message: error.message });
      } 
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

