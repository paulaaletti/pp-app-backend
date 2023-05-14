const db = require("../models");
const { publicProfileInformation: PublicProfileInformation} = db;

exports.updatePublicProfileInformation = async (req, res) => {
  PublicProfileInformation.findOne({
    where: {
      userId: req.body.userId,
    },
  })
  .then(async (userInfo) => {
    if (userInfo) {
      PublicProfileInformation.update({
        linkedInProfile: req.body.linkedInProfile,
        facebookProfile: req.body.facebookProfile,
        twitterProfile:   req.body.twitterProfile,
        instagramProfile: req.body.instagramProfile,
        headerText: req.body.headerText,
        totalAmountDonated: req.body.totalAmountDonated,
        refferalsQuantity: req.body.refferalsQuantity,
        chosenCoverPhotoId: req.body.chosenCoverPhotoId,
        biography: req.body.biography,
      }, {
        where: {
          id: userInfo.id,
        },
      })
      .then(async (user) => {
        if (user) {
          res.status(200).send({message: "La informacion del perfil publico del usuario se ha cambiado exitosamente"})
        }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }else{
      res.status(404).send({ message: "Public Profile Information not found." });
    }
    })
};

exports.getPublicProfileInformation = async (req, res) => {
    PublicProfileInformation.findOne({
      where: {
        userId: req.body.userId,
      },
    })
      .then(async (userInfo) => {
        res.status(200).send(userInfo);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };