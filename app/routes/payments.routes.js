const controller = require("../controllers/payments.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/payment/createSubscription", controller.createSubscription);
  app.post("/api/payment/createTransaction", controller.createTransaction);
  app.post("/api/payment/modifySubscription", controller.modifySubscription);
  app.post("/api/payment/modifySubscriptionState", controller.modifySubscriptionState);
  app.post("/api/payment/modifyTransactionState", controller.modifyTransactionState);
  app.post("/api/payment/getSubscription", controller.getSubscription);
  app.post("/api/payment/getTransaction", controller.getTransaction);
  app.post("/api/payment/getSubscriptions", controller.getSubscriptions);
  app.get("/api/payment/filterSubscriptions", controller.filterSubscriptions)
  app.get("/api/payment/getPendingTransactions", controller.getPendingTransactions)
  app.post("/api/payment/getTransactions", controller.getTransactions)
  app.post("/api/payment/getAllHistoricSubscriptions", controller.getAllHistoricSubscriptions)
  app.post("/api/payment/getSubscriptionsStatesByMonth", controller.getSubscriptionsStatesByMonth)
  app.post("/api/payment/getMonthIncome", controller.getMonthIncome)
  app.post("/api/payment/addReferred", controller.addReferred)
  app.post("/api/payment/countRecurrentTransactions", controller.countRecurrentTransactions)
  app.post("/api/payment/assingLongevityMilestone", controller.assingLongevityMilestone)
  app.post("/api/payment/amountDonatedByRefferals", controller.amountDonatedByRefferals)
  app.post("/api/payment/getDashboardsInfo", controller.getDashboardsInfo)
};