module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
      name: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      referralsQuantity:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalAmountDonated:{
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },  
    });
    return User;
  };