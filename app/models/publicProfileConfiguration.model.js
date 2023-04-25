module.exports = (sequelize, Sequelize) => {
    const PublicProfileConfiguration = sequelize.define("publicProfileConfiguration", {
      showLifeImpact: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      showReferralsQuantity:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      showTotalAmountDonated:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      showReferralsTotalAmountDonated:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },   
    });
    return PublicProfileConfiguration;
  };