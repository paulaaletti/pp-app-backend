const db = require("../models");
const { publicProfileConfiguration: PublicProfileConfiguration} = db;

exports.updatePublicProfileConfiguration = async (req, res) => {
  PublicProfileConfiguration.findOne({
    where: {
      userId: req.body.userId,
    },
  })
  .then(async (userConfig) => {
    if (userConfig) {
      PublicProfileConfiguration.update({
        userId: req.body.userId,
        showLifeImpact: req.body,
        showReferralsQuantity:req.body.showReferralsQuantity,
        showTotalAmountDonated:req.body.showTotalAmountDonated,
        showReferralsTotalAmountDonated:req.body
      }, {
        where: {
          id: userConfig.id,
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
        const userConfig = await PublicProfileConfiguration.create({
          userId: req.body.userId,
          showLifeImpact: req.body,
          showReferralsQuantity:req.body.showReferralsQuantity,
          showTotalAmountDonated:req.body.showTotalAmountDonated,
          showReferralsTotalAmountDonated:req.body
        });
        if (!userConfig) {
          return res.status(500).send({ message: "Error creating Public Profile Configuration" });
        };
        res.send({ message: "Public Profile Configuration created successfully!" });
      } catch (error) {
        res.status(500).send({ message: error.message });
      } 
    }
    });
};

  exports.getPublicProfileConfiguration = async (req, res) => {
    PublicProfileConfiguration.findOne({
      where: {
        userId: req.body.userId,
      },
    })
      .then(async (userConfig) => {
        res.status(200).send(userConfig);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };

