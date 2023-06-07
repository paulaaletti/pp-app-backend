module.exports = (sequelize, Sequelize) => {
    const SubscriptionStateHistoric = sequelize.define("subscriptionStateHistoric", {
      state: {
        type: Sequelize.ENUM("A","C","P")
      },
      totalActiveToTheMoment: {
        type: Sequelize.INTEGER
      },
      totalPausedToTheMoment: {
        type: Sequelize.INTEGER
      },
      totalCancelledToTheMoment: {
        type: Sequelize.INTEGER
      },
    });
    return SubscriptionStateHistoric;
  };