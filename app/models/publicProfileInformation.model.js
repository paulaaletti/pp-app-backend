module.exports = (sequelize, Sequelize) => {
    const PublicProfileInformation = sequelize.define("publicProfileInformation", {
      publicProfileUrl: {
        type: Sequelize.STRING
      },
      linkedInProfile: {
        type: Sequelize.STRING
      },
      facebookProfile: {
        type: Sequelize.STRING
      },
      twitterProfile: {
        type: Sequelize.STRING
      },
      instagramProfile: {
        type: Sequelize.STRING
      },
      headerText: {
        type: Sequelize.STRING
      },
      referralsQuantity:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalAmountDonated:{
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      chosenCoverPhotoId:{
        type: Sequelize.INTEGER,
        defaultValue: 1,
      }
    });
    return PublicProfileInformation;
  };