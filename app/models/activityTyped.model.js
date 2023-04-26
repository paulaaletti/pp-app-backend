const DataTypes = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const ActivityTyped = sequelize.define("activityTyped", {
      title: {
        type: Sequelize.STRING,
      },
      icon: {
        type: DataTypes.BLOB,
      }
    });
    return ActivityTyped;
  };