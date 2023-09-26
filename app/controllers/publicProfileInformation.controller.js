const db = require("../models");
const axios = require("axios");
const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { publicProfileInformation: PublicProfileInformation, user: User, publicProfileConfiguration: PublicProfileConfiguration} = db;

const amountDonatedByRefferals = (userId) => {
  return axios.post("http://localhost:8080/api/payment/" + "amountDonatedByRefferals", {
    userId,
  });
};

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

exports.getPublicProfileInformationByUserURL = async (req, res) => {
  try {
    /* const userInfo = await PublicProfileInformation.findOne({
      where: { publicProfileUrl: req.body.userURL },
      include: [
        { model: User, required: true },
        { model: PublicProfileConfiguration, required: true,
          on: {
            'publicProfileInformation.userId': Sequelize.col('publicProfileConfiguration.userId')
          } 
        },
      ],
    }) */

    const queryResp = await db.sequelize.query(`
      SELECT
          ppc.*,      
          ppi.*,
          u.*  
      FROM
          defaultdb.publicProfileInformations AS ppi
      JOIN
          defaultdb.publicProfileConfigurations AS ppc
      ON
        ppc.userId = ppi.userId
      JOIN
        defaultdb.users AS u
      ON
        u.id = ppi.userId
      WHERE
          ppi.publicProfileUrl = :userURL;
    `, {
      replacements: { userURL: req.body.userURL },
      type: QueryTypes.SELECT,
    });
    
    const userInfo = queryResp[0];
    console.log("---------------------------------")
    console.log(userInfo)
    console.log("---------------------------------")

    const totalDonatedByRefferals = await amountDonatedByRefferals(userInfo.id)
    const correctoUserInfo = {
      id: userInfo.id,
      linkedInProfile: userInfo.linkedInProfile,
      facebookProfile: userInfo.facebookProfile,
      twitterProfile: userInfo.twitterProfile,
      instagramProfile: userInfo.instagramProfile,
      headerText: userInfo.headerText,
      chosenCoverPhotoId: userInfo.chosenCoverPhotoId,
      biography: userInfo.biography,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        lastname: userInfo.lastname,
      },
      publicProfileConfiguration: {
        showLifeImpact: userInfo.showLifeImpact,
        showReferralsTotalAmountDonated: userInfo.showReferralsTotalAmountDonated,
        showReferralsQuantity: userInfo.showReferralsQuantity,
        showTotalAmountDonated: userInfo.showTotalAmountDonated,
    }}
    if (userInfo.showReferralsQuantity) correctoUserInfo['referralsQuantity']= userInfo.referralsQuantity;
    if(userInfo.showTotalAmountDonated) correctoUserInfo['totalAmountDonated'] = userInfo.totalAmountDonated;
    if(userInfo.showLifeImpact) correctoUserInfo['lifeImpact'] = userInfo.totalAmountDonated+ totalDonatedByRefferals.data.total;
    if(userInfo.showReferralsTotalAmountDonated) correctoUserInfo['referralsTotalAmountDonated'] = totalDonatedByRefferals.data.total;

    res.status(200).send(correctoUserInfo);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};