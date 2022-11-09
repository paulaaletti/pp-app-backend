const db = require("../models");
const { user: User, subscription: Subscription, transaction: Transaction, subscriptionState: SubscriptionState, transactionState: TransactionState, subscriptionStateHistoric: SubscriptionStateHistoric, milestone:Milestone} = db;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

exports.createMilestone = async (req, res) => {
    try {
      const milestone = await Milestone.create({
        title: req.body.title,
        description:req.body.description,
      });
      if (!milestone) {
        return res.status(500).send({ message: "Error creating milestone" });
      };
      res.send({ message: "Milestone created successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.getUserWithMilestones = async (req, res) => {
      User.findOne({
        where: {id: req.body.userId},
        include: [
          db.milestone,
        ],
      })
      .then(async (userData) => {
        res.status(200).send(userData);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };