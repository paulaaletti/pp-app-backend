module.exports = (sequelize, Sequelize) => {
    const SubscriptionState = sequelize.define("subscriptionState", {
      state: {
        type: Sequelize.ENUM("A","C","P")
      }
    });
    return SubscriptionState;
  };