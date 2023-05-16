const {DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const UserPersonalInformation = sequelize.define("userPersonalInformation", {
      city: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      country: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      dateOfBirth: {
        type: Sequelize.STRING,
      },
      phoneNumber:{
        type: Sequelize.STRING,
        defaultValue: "",
      }, 
    });
    return UserPersonalInformation;
  };