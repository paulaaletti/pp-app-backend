module.exports = (sequelize, Sequelize) => {
    const PublicProfileInformation = sequelize.define("publicProfileInformation", {
      publicProfileUrl: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      linkedInProfile: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      facebookProfile: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      twitterProfile: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      instagramProfile: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      headerText: {
        type: Sequelize.STRING,
        defaultValue: "",
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
      },
      biography:{
        type: Sequelize.TEXT,
        defaultValue: "",
      } 
    });
    return PublicProfileInformation;
  };