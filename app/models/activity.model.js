module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("activity", {
      description: {
        type: Sequelize.STRING,
      }
    });
    return Activity;
  };