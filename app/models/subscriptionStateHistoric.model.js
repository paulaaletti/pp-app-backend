module.exports = (sequelize, Sequelize) => {
    const SubscriptionStateHistoric = sequelize.define("subscriptionStateHistoric", {
      state: {
        type: Sequelize.ENUM("A","C","P")
      },
    });
    return SubscriptionStateHistoric;
  };