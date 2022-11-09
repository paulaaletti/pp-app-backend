const db = require("../models");
const { activity: Activity, user: User, subscription: Subscription, transaction: Transaction, subscriptionState: SubscriptionState, transactionState: TransactionState, subscriptionStateHistoric: SubscriptionStateHistoric, milestone:Milestone} = db;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

exports.createActivity = async (req, res) => {
    try {
      const act = await Activity.create({
        title: req.body.title,
        description:req.body.description,
        userId: req.body.userId
      });
      if (!act) {
        return res.status(500).send({ message: "Error creating activity" });
      };
      res.send({ message: "Activity created successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.getUserActivities = async (req, res) => {
      Activity.findAll({
        where: {userId: req.body.id},
        order:[['id','DESC']],
        limit:5,
      })
      .then(async (userAct) => {
        res.status(200).send(userAct);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };