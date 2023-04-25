const {DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    const UserPersonalInformation = sequelize.define("userPersonalInformation", {
      city: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      dateOfBirth: {
        type: Sequelize.DATE
      },
      phoneNumber:{
        type: Sequelize.STRING,
      },
      biography:{
        type: Sequelize.TEXT,
      }  
    });
    return UserPersonalInformation;
  };