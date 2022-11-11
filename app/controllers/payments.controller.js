const { subscriptionStateHistoric } = require("../models");
const db = require("../models");
const { user: User, subscription: Subscription, transaction: Transaction, subscriptionState: SubscriptionState, transactionState: TransactionState, subscriptionStateHistoric: SubscriptionStateHistoric ,user_milestone: User_milestone} = db;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;
//const sequelize = new Sequelize('sqlite::memory:');
const sequelize = new Sequelize('postgres://wtukelbehxinsv:d49ff7b066783cae788b94cab4b23d673cd689b8c3c8bb12fc80de824f73b503@ec2-3-220-207-90.compute-1.amazonaws.com:5432/dai8n8nsdbani8');

verifyFirstSubscription = async (userId) => {
    Subscription.findOne({
        where: {
          userId: userId
        }
      })
      .then(async (subs) => {
            if (!subs) {
            return ({ message: "Subscription Not found." });
            }
            try {
                console.log(subs.length)
                return subs.length
            }
            catch (error) {
              return "Error";
            }
        }).catch(err => {
            return "Subscription Not found.";
        });
}

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create({
      amount: req.body.amount,
      frequency: req.body.frequency,
      lastPaymentDate: req.body.lastPaymentDate,
      nextPaymentDate: req.body.nextPaymentDate,
      userId: req.body.userId,
    });
    if (subscription) {
      const subscriptionState = await SubscriptionState.create({
        state: "A",
        subscriptionId: subscription.id,
      });
      const subscriptionStateHistoric = await SubscriptionStateHistoric.create({
        state: "A",
        subscriptionId: subscription.id,
      });
      console.log("llega a esto")
      User.findOne({
        where: {
          id: req.body.userId
        }
        }).then(async (user) => {
            const response = user.setMilestones([2]);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    };
    res.send({ message: "Subscription created successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  console.log("entra")
  console.log(req.body)
  var d = new Date();
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;
    date = [year, month, day].join('-');
  if(Object.keys(req.body).length === 0){
    res.status(400).send({ message: "Empty request" });
    return 0;
  }
  try {
    console.log("entra2")
    const transaction = await Transaction.create({
      amount: req.body.amount,
      type: req.body.type,
      paymentDate: date,
      userId: req.body.userId,
      subscriptionId: req.body.subscriptionId,
    });
    if (transaction) {
      const transactionState = await TransactionState.create({
        state: "P",
         transactionId: transaction.id,
      });
      res.send({ message: "Transaction created successfully!" });
    };
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.modifySubscription = async (req, res) => {
    Subscription.findOne({
      where: {
        id: req.body.subscriptionId
      }
      })
      .then(async (subs) => {
            if (!subs) {
            return res.status(404).send({ message: "Subscription Not found." });
            }
            try {
            const subscription = await Subscription.upsert({
                id: subs.id,
                amount: req.body.amount,
                frequency: req.body.frequency,
                nextPaymentDate: req.body.nextPaymentDate,
                lastPaymentDate: req.body.lastPaymentDate,
            });
                res.send({ message: "Subscription modified successfully!" });
            }
            catch (error) {
            res.status(500).send({ message: error.message });
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
}

exports.modifySubscriptionState = async (req, res) => {
    SubscriptionState.findOne({
        where: {
          subscriptionId: req.body.subscriptionId
        }
      })
      .then(async (subs) => {
            if (!subs) {
            return res.status(404).send({ message: "Subscription state Not found." });
            }
            try {
            const subscriptionState = await SubscriptionState.upsert({
                id: subs.id,
                state: req.body.state,
            });
                res.send({ message: "Subscription state modified successfully!" });
            }
            catch (error) {
            res.status(500).send({ message: error.message });
            }
            modifySubscriptionHistoric(req.body.subscriptionId,req.body.state,new Date().getFullYear(), new Date().getMonth() + 1) //año y mes, se pasan desde el filtro
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
}

exports.modifyTransactionState = async (req, res) => {
    TransactionState.findOne({
        where: {
          transactionId: req.body.transactionId
        }
      })
      .then(async (subs) => {
            if (!subs) {
            return res.status(404).send({ message: "Transaction Not found." });
            }
            if(subs.state !== "P"){
              return res.status(400).send({ message: "Invalid state modification." });
            }
            try {
            const transactionState = await TransactionState.upsert({
                id: subs.id,
                state: req.body.state,
            });
                res.send({ message: "Transaction state modified successfully!" });
            }
            catch (error) {
            res.status(500).send({ message: error.message });
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
}

exports.getSubscription = async (req, res) => {
  Subscription.findOne({
      where: {
        userId: req.body.userId,
      },
      include: [{
        model: SubscriptionState,
        where: {
          state:{
            [Op.or]: ["A", "P"]
          }
        },
        attributes: ['state'],
        required: true
      }]
    })
    .then(async (subs) => {
          if (!subs) {
            return res.status(200).send(undefined);
            //return res.status(404).send({ message: "Subscription Not Found" });
          }
          res.status(200).send(subs);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.getSubscriptions = async (req, res) => {
  Subscription.findAll({
      limit: req.body.limit,
      include: [{
        model: SubscriptionState,
        attributes: ['state'],
        required: true
      }],
      offset: req.body.offset
    })
    .then(async (trans) => {
          if (!trans) {
          return res.status(404).send({ message: "Subscriptions not found" });
          }
          res.status(200).send(trans);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.getTransactions = async (req, res) => {
  Transaction.findAll({
      limit: req.body.limit,
      include: [{
        model: TransactionState,
        attributes: ['state'],
        required: true
      }],
      offset: req.body.offset
    })
    .then(async (trans) => {
          if (!trans) {
          return res.status(404).send({ message: "Transactions for this user not found" });
          }
          res.status(200).send(trans);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.getTransaction = async (req, res) => {
  Transaction.findAll({
      where: {userId: req.body.userId},
      include: [{
        model: TransactionState,
        attributes: ['state'],
        required: true
      }],
    })
    .then(async (trans) => {
          if (!trans) {
          return res.status(404).send({ message: "Transactions for this user not found" });
          }
          res.status(200).send(trans);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.filterSubscriptions = async (req, res) => {
  var d = new Date();
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;
    date = [year, month, day].join('-');
  Subscription.findAll({
      where:{nextPaymentDate:  date },
      include: [{
        model: SubscriptionState,
        where: {state: "A"},
        attributes: ['state'],
        required: true
      }],
    })
    .then(async (subs) => {
          if (!subs) {
          return res.status(404).send({ message: "Subs not found" });
          }
          res.status(200).send(subs);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.countRecurrentTransactions = async (req, res) => {
 Transaction.findAll({
  where:{
    type: 'recurrent'
  },
  group: ['subscriptionId','userId'],
  attributes: ['userId','subscriptionId', [Sequelize.fn('COUNT', 'subscriptionId'), 'count']],
  order: [
    [Sequelize.literal('count'), 'DESC']
  ],
  raw: true, // <-- HERE
}).then(async(resp)=>{
  console.log(resp);
  res.status(200).send(resp);
}).catch(err => {
  res.status(500).send({ message: err.message });
});
}

exports.assingLongevityMilestone = async (req, res) => {
  User.FindOne({
    where: {
      id: req.body.userId,
    }
  }).then(async (user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    console.log(res)
      //user.setMilestones([req.body.milestoneId]);
      res.status(200).send({ message: "Milestone assigned successfully!" });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
}

exports.getPendingTransactions = async (req, res) => {
  console.log("getPendingTransactions");
  TransactionState.findAll({
      where: {state: "P"},
    })
    .then(async (trans) => {
          if (!trans) {
          return res.status(404).send({ message: "Pending transactions not found" });
          }
          res.status(200).send(trans);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

modifySubscriptionHistoric = async (subscriptionId,state,year,month) => {
  //db.sequelize.query('SELECT * FROM "subscriptionStateHistorics" WHERE "subscriptionId" = '+subscriptionId+' AND (EXTRACT(YEAR FROM "createdAt") = '+year+' AND EXTRACT(MONTH FROM "createdAt") ='+month)
  console.log("llamada")
  db.sequelize.query('SELECT * FROM "subscriptionStateHistorics" WHERE "subscriptionId" ='+subscriptionId+' and EXTRACT(YEAR FROM "createdAt")='+year+' and EXTRACT(MONTH FROM "createdAt")='+month+' LIMIT 1').then(async (subs) => {
          
          if (!subs) {
            const subscriptionStateHistoric = await SubscriptionStateHistoric.create({
              subscriptionId: subscriptionId,
              state: state,
          });
          return "insertado"
          //return res.status(404).send({ message: "Subs not found" });
          }
          subs=subs[0][0]
          const subscriptionStateHistoric = await SubscriptionStateHistoric.upsert({
            id: subs.id,
            state: state,
        });
          return "insertado"
      }).catch(err => {
          return "error"
      });
}

exports.getAllHistoricSubscriptions = async (req, res) => {
  SubscriptionStateHistoric.findAll()
    .then(async (subs) => {
          if (!subs) {
          return res.status(404).send({ message: "Subs not found" });
          }
          res.status(200).send(subs);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.getSubscriptionsStatesByMonth = async (req, res) => {
  db.sequelize.query('SELECT * FROM "subscriptionStateHistorics" WHERE ((EXTRACT(YEAR FROM "createdAt") = '+req.body.year+' AND EXTRACT(MONTH FROM "createdAt") <='+req.body.month+'and (state =\'A\' or state =\'P\')) or (EXTRACT(YEAR FROM "createdAt") = '+req.body.year+' AND EXTRACT(MONTH FROM "createdAt") ='+req.body.month+'))').then(async (subsS) => {
    if (!subsS) {
    return res.status(404).send({ message: "SubsS by month not found" });
    }
    console.log(subsS[0]);
    res.status(200).send(subsS[0]);
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
}

exports.getMonthIncome = async (req, res) => {
  if(req.body.month == undefined){
    return "null"
  }
  var d = new Date();
      actualMonth = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    
  if (actualMonth.length < 2) 
      actualMonth = '0' + actualMonth;

  if (day.length < 2) 
      day = '0' + day;
  
  var monthAsString = req.body.month.toString();
  if (monthAsString.length < 2) monthAsString = '0' + req.body.month.toString();

  date = [year, monthAsString].join('-');
  //res.status(200).send({"total": 0})

  if(req.body.month <((new Date()).getMonth() + 1)){
    Transaction.findAll({  
      where: {
        paymentDate: {
          [Op.like]: `${date}%` // LIKE '%sample_fruit_string%'
        },
      },
      include: [{
        model: TransactionState,
        attributes: [],
        where:
        {state: "A"},
          //{[Op.and] : [{state: "A"} ,
          //sequelize.where(sequelize.fn('MONTH', SubscriptionStateHistoric.sequelize.col(`paymentDate`)), req.body.month),
          //sequelize.where(sequelize.fn('YEAR', SubscriptionStateHistoric.sequelize.col('paymentDate')), year)]},
        required: true
      },
     ],
      attributes: [
        [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAssetAmount"]
      ],
      group : ['transaction.id']
    })
    .then(async (trans) => {
      if (!trans) {
      return res.status(404).send({ message: "trans by month not found" });
      }
        if(trans.length == 0){
          console.log("null")
          transAmount=0
        }else{
          transAmount=parseInt(trans[0].dataValues.totalAssetAmount)
        }
      res.status(200).send({"total": transAmount})
     }).catch(err => {
        res.status(500).send({ message: err.message });
     });
    }
    else if (req.body.month == ((new Date()).getMonth() + 1)){
      console.log("entra")
      Transaction.findAll({
        attributes: [[Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAssetAmount"]],
        where: {
          paymentDate: {
            [Op.like]: `${date}%` // LIKE '%sample_fruit_string%'
          },
        },
        include: [{
          model: TransactionState,
          attributes: [],
          where:
            {state: "A"},/*
            sequelize.where(sequelize.fn('MONTH', SubscriptionStateHistoric.sequelize.col('paymentDate')), req.body.month),
            sequelize.where(sequelize.fn('YEAR', SubscriptionStateHistoric.sequelize.col('paymentDate')), year)]},*/
          required: true
        },
      ],
      group : ['transaction.id']
      })
      .then(async (trans) => {
        if (!trans) {
        return res.status(404).send({ message: "trans by month not found" });
        }
        if(trans.length == 0){
          transAmount=0
        }else{
          transAmount=parseInt(trans[0].dataValues.totalAssetAmount)
        }
        Subscription.findAll({  
          where: {
            nextPaymentDate: {
              [Op.like]: `${date}%` // LIKE '%sample_fruit_string%'
            },
          },
          include: [{
            model: SubscriptionState,
            attributes: [],
            where:{state: "A"},
            required: true
          },
        ],
          attributes: [
            [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAssetAmount"]
          ],
          group : ['subscription.id']
        })
        .then(async (subs) => {
          if (!subs) {
          return res.status(404).send({ message: "trans by month not found" });
          }
          if(subs.length == 0){
            subsAmount=0
          }else{
            subsAmount=subs[0].dataValues.totalAssetAmount
          }
          res.status(200).send({"total": (transAmount+subsAmount)})
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
    }
    else{
      Subscription.findAll({  
        where: {
          nextPaymentDate: {
            [Op.like]: `${date}%` // LIKE '%sample_fruit_string%'
          },
        },
        include: [{
          model: SubscriptionState,
          attributes: [],
          where:{state: "A"},
          required: true
        },
      ],
        attributes: [
          [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAssetAmount"]
        ],
        group : ['subscription.id']
      })
      .then(async (trans) => {
        if (!trans) {
        return res.status(404).send({ message: "trans by month not found" });
        }
        if(trans.length == 0){
          transAmount=0
        }else{
          transAmount=parseInt(trans[0].dataValues.totalAssetAmount)
        }
        res.status(200).send({"total": transAmount})
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
    }
};

exports.addReferred = async (req, res) => {
  User.findOne({where: {id: req.body.userReferredId},})
  .then(async (userReferred) => {
        if (!userReferred) {
        return res.status(404).send({ message: "userReferred not found" });
        }
        User.findOne({where: {id: req.body.userReferrerId},})
        .then(async (userReferrer) => {
              if (!userReferrer) {
              return res.status(404).send({ message: "userReferrer not found" });
              }
              const result = userReferrer.setReferrerUser(userReferred);
              if (result) res.send({ message: "UserReferred successfully created!" });
          }).catch(err => {
              res.status(500).send({ message: err.message });
        });

    }).catch(err => {
        res.status(500).send({ message: err.message });
  });
}