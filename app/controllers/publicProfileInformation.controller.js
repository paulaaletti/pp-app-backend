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
        publicProfileUrl: req.body.publicProfileUrl,
        linkedInProfile: req.body.linkedInProfile,
        facebookProfile: req.body.facebookProfile,
        twitterProfile:   req.body.twitterProfile,
        instagramProfile: req.body.instagramProfile,
        headerText: req.body.headerText,
        chosenCoverPhotoId: req.body.chosenCoverPhotoId,
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
        const userInfo = await PublicProfileInformation.create({
          publicProfileUrl: req.body.publicProfileUrl,
          linkedInProfile: req.body.linkedInProfile,
          facebookProfile: req.body.facebookProfile,
          twitterProfile:   req.body.twitterProfile,
          instagramProfile: req.body.instagramProfile,
          headerText: req.body.headerText,
          chosenCoverPhotoId: req.body.chosenCoverPhotoId,
          userId: req.body.userId,
        });
        if (!userInfo) {
          return res.status(500).send({ message: "Error creating Public Profile Information" });
        };
        res.send({ message: "Public Profile Information created successfully!" });
      } catch (error) {
        res.status(500).send({ message: error.message });
      } 
    }
    });
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