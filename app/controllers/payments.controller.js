const axios = require('axios');
const db = require("../models");
const { user: User, subscription: Subscription, transaction: Transaction, subscriptionState: SubscriptionState, transactionState: TransactionState, subscriptionStateHistoric: SubscriptionStateHistoric, publicProfileInformation: PublicProfileInformation} = db;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

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
                return subs.length
            }
            catch (error) {
              return "Error";
            }
        }).catch(() => {
            return "Subscription Not found.";
        });
}

function verifySubscrptionData(req){
  message = ""
  if (typeof(req.body.userId)!= "number"){
    message += "userid debe ser un entero."
  }
  if (typeof(req.body.frequency)!= "number" || !([1,2,3,4].includes(req.body.frequency))){
    message += " La frecuencia es inválida."
  }
  if (typeof(req.body.amount)!= "number" || req.body.amount < 0){
    message += " El monto es inválido."
  }
  if (typeof(req.body.nextPaymentDate)!= "string"){
    message += " La fecha de pago es inválida."
  }
  return message
}

function verifyTransactionData(req){
  message = ""
  if (typeof(req.body.userId)!= "number"){
    message += "userid debe ser un entero válido."
  }
  if  (typeof(req.body.amount)!= "number" || req.body.amount < 0){
    message += " El monto es inválido."
  }
  if (typeof(req.body.type)!= "string" || !(["onlyTime","recurrent"].includes(req.body.type))){
    message += " El tipo de transacción es inválido."
  }
  return message
}

exports.createSubscription = async (req, res) => {
  var message = verifySubscrptionData(req)
  if (message != ""){
    return res.status(400).send({ message: message });
  } 
  try {
    const subscription = await Subscription.create({
      amount: req.body.amount,
      frequency: req.body.frequency,
      lastPaymentDate: req.body.lastPaymentDate,
      nextPaymentDate: req.body.nextPaymentDate,
      userId: req.body.userId,
    });
    if (subscription) {
      SubscriptionState.create({
        subscriptionId: subscription.id,
        state: "A",
      });
    };
    res.send({ message: "Subscription created successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  if(Object.keys(req.body).length === 0){
    res.status(400).send({ message: "Empty request" });
    return 0;
  }
  var message = verifyTransactionData(req)
  if(message != ""){
    return res.status(400).send({ message: message });
  }
  
  var d = new Date();
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;
    date = [year, month, day].join('-');

    try {
      const transaction = await Transaction.create({
        amount: req.body.amount,
        type: req.body.type,
        paymentDate: date,
        userId: req.body.userId,
        subscriptionId: req.body.subscriptionId,
      });
    
      if (transaction) {
        await TransactionState.create({
          transactionId: transaction.id,
          state: "P",
        });
    
        const donner = await PublicProfileInformation.findOne({
          where: {userId: req.body.userId},
          include: [{
            model: User,
            required: true,
            include: [{
              model: User,
              as: "ReferredUser",
              required: false,
            }],
          }],
        })
        await PublicProfileInformation.update(
          { totalAmountDonated: donner.dataValues.totalAmountDonated + req.body.amount },
          { where: { userId: req.body.userId } }
        );
    
        if(donner.dataValues.user.dataValues.ReferredUser.length > 0){
          const referrerId = donner.dataValues.user.dataValues.ReferredUser[0].id;
          const capitalizedDonnerName = donner.dataValues.user.dataValues.name.charAt(0).toUpperCase() + donner.dataValues.user.dataValues.name.slice(1)
          if (referrerId) {
            await axios.post("http://localhost:8080/api/activities/createActivity", {
              activityTypeId: 9,
              description: capitalizedDonnerName + " ha realizado una donacion de $" + req.body.amount + ".",
              userId: referrerId,
            });
        }
      }
    
        res.send({ message: "User total amount donates modify successfully and transaction was correctly created!" });
      };
    } catch (error) {
      console.log(error);
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
    SubscriptionState.update({ state: req.body.state }, {
        where: {
          subscriptionId: req.body.subscriptionId
        }
      })
      .then(async (subs) => {
            if (!subs) {
            return res.status(404).send({ message: "Subscription state Not found." });
            }
            try {
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
    if(req.body.milestoneId ==  3){
      user.setMilestones([1,2,req.body.milestoneId]);
    }
    else{
      user.setMilestones([1,2,3,req.body.milestoneId]);
    }
      
      res.status(200).send({ message: "Milestone assigned successfully!" });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
}

exports.getPendingTransactions = async (req, res) => {
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
  db.sequelize.query('SELECT * FROM "subscriptionStateHistorics" WHERE "subscriptionId" ='+subscriptionId+' and EXTRACT(YEAR FROM "createdAt")='+year+' and EXTRACT(MONTH FROM "createdAt")='+month+' LIMIT 1').then(async (subs) => {
          
          if (!subs) {
          return "insertado"
          //return res.status(404).send({ message: "Subs not found" });
          }
          subs=subs[0][0]
          return "insertado"
      }).catch(() => {
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
    res.status(200).send(subsS[0]);
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
}

exports.getMonthIncome = async (req, res) => {
  if(req.body.month == undefined || req.body.month > 12 || req.body.month < 1){
    return res.status(404).send({ message: "Month Not found." });
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
      Transaction.findAll({
        attributes: [[Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAssetAmount"],"subscriptionId"],
        where: {
          paymentDate: {
            [Op.like]: `${date}%` 
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
          subsIds=[]
        }else{
          transAmount=0
          trans.map(t => transAmount+= parseInt(t.dataValues.totalAssetAmount))
          subsIds=trans.map(t => t.dataValues.subscriptionId);
        }
        Subscription.findAll({  
          where: {
            nextPaymentDate: {
              [Op.like]: `${date}%` 
            },
            id: {
              [Op.notIn]: subsIds,
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
  console.log(req.body);
  User.findOne({
    where: {id: req.body.userReferredId},
  })
  .then(async (userReferred) => {
        if (!userReferred) {
        return res.status(404).send({ message: "userReferred not found" });
        }
        User.findOne({
          where: {id: req.body.userReferrerId},
          include: [{
            model: PublicProfileInformation,
            required: true
          }],
        })
        .then(async (userReferrer) => {
              if (!userReferrer) {
              return res.status(404).send({ message: "userReferrer not found" });
              }
        PublicProfileInformation.update(
                { referralsQuantity: userReferrer.publicProfileInformations[0].dataValues.referralsQuantity + 1},
                { 
                  where: { userId: req.body.userReferrerId } ,
                  returning: true,
                  plain: true
                }  
              ).then(async () => {}).catch(err => { res.status(500).send({ message: err.message }); });

              const result = userReferrer.addReferrerUser(userReferred);
              if (result) {
                res.send({ message: "UserReferred successfully created!" });
                
              }
          }).catch(err => {
              res.status(500).send({ message: err.message });
        });

    }).catch(err => {
        res.status(500).send({ message: err.message });
  });
}

exports.amountDonatedByRefferals = async (req, res) => {
  User.findAll({
    where: {id: req.body.userId},
    include: [{
      model: User,
      as: "ReferrerUser",
      required: true
    }],
  })
  .then(async (rta) => {
    console.log(rta);
    if (rta.length != 0) {
      let users = rta[0].ReferrerUser;
      console.log(users);
      let totalAmountFromReferals = 0;

      for (const user of users) {
        try {
          const userInfo = await PublicProfileInformation.findOne({
            where: { userId: user.id },
          });
          totalAmountFromReferals += userInfo.totalAmountDonated;
        } catch (err) {
          return res.status(500).send({ message: err.message });
        }
      }
      res.status(200).send({"total": totalAmountFromReferals}) 
  } else {
      res.status(200).send({"total": 0}) 
  }
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
};
