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
        showLifeImpact: req.body.showLifeImpact,
        showReferralsQuantity:req.body.showReferralsQuantity,
        showTotalAmountDonated:req.body.showTotalAmountDonated,
        showReferralsTotalAmountDonated:req.body.showReferralsTotalAmountDonated
      }, {
        where: {
          id: userConfig.id,
        },
      })
      .then(async (user) => {
        if (user) {
          res.status(200).send({message: "La configuracion del perfil publico del usuario se ha cambiado exitosamente"})
        }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }else{
      res.status(404).send({ message: "Public Profile Configuration not found." });
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

