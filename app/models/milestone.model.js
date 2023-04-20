const {DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const Milestone = sequelize.define("milestone", {
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      icon: {
        type: DataTypes.BLOB,
      }
    });
    return Milestone;
  };