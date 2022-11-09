module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("transaction", {
      amount: {
        type: Sequelize.FLOAT
      },
      paymentDate: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM("onlyTime","recurrent")
      }
    });
    return Transaction;
  };