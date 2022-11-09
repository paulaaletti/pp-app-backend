module.exports = (sequelize, Sequelize) => {
    const TransactionState = sequelize.define("transactionState", {
      state: {
        type: Sequelize.ENUM("P","R","A")
      }
    });
    return TransactionState;
  };