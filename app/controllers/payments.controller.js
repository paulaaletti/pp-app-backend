const axios = require('axios');
const db = require("../models");
const { user: User, subscription: Subscription, transaction: Transaction, subscriptionState: SubscriptionState, transactionState: TransactionState, subscriptionStateHistoric: SubscriptionStateHistoric, publicProfileInformation: PublicProfileInformation} = db;
const Op = db.Sequelize.Op;
const literal = db.Sequelize.literal;
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

      addEntryToSubsStateHistory(subscription);
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
    Subscription.update({ lastPaymentDate: req.body.lastPaymentDate, 
                          nextPaymentDate: req.body.nextPaymentDate, 
                          amount:  req.body.amount,
                          frequency: req.body.frequency}, {
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
    SubscriptionState.findOne({ where: { subscriptionId: req.body.subscriptionId } }).then(async (oldSubs) => {
        if (!oldSubs) {
          return res.status(404).send({ message: "Subscription state Not found." });
        }
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
              addEntryToSubsStateHistoryWhenModify(req.body.subscriptionId,req.body.state, oldSubs.state)
          }).catch(err => {
              res.status(500).send({ message: err.message });
          });
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

function resetTotalCancelledToTheMomentIfNecessary(totalCancelledToTheMoment, previousOneDate){
  var d = new Date();
  month = d.getMonth() + 1;
  year = d.getFullYear();

  var previousD = new Date(previousOneDate);
  previousMonth = previousD.getMonth() + 1;
  previousYear = previousD.getFullYear();

  console.log(month, year, previousMonth, previousYear)

  return (month === previousMonth && year === previousYear) ? totalCancelledToTheMoment : 0;
}

addEntryToSubsStateHistoryWhenModify = async (subscriptionId,state, oldState) => {
  SubscriptionStateHistoric.findOne({
    order: [['createdAt', 'DESC']], // Fetch the latest entry based on createdAt column
  })
    .then((latestEntry) => {
      
      totalActiveToTheMoment =  state==="A" ? latestEntry.totalActiveToTheMoment + 1 : latestEntry.totalActiveToTheMoment;
      totalPausedToTheMoment =  state==="P" ? latestEntry.totalPausedToTheMoment + 1 : latestEntry.totalPausedToTheMoment;
      
      totalCancelledToTheMoment = resetTotalCancelledToTheMomentIfNecessary(latestEntry.totalCancelledToTheMoment, latestEntry.createdAt);
      totalCancelledToTheMoment =  state==="C" ? totalCancelledToTheMoment + 1 : totalCancelledToTheMoment; 
            
      oldState === "A" ? totalActiveToTheMoment = latestEntry.totalActiveToTheMoment - 1 : totalActiveToTheMoment;
      oldState === "P" ? totalPausedToTheMoment = latestEntry.totalPausedToTheMoment - 1 : totalPausedToTheMoment;
      

      // Create a new entry in SubscriptionStateHistoric table
      return SubscriptionStateHistoric.create({
        subscriptionId: subscriptionId,
        state: state,
        totalActiveToTheMoment: totalActiveToTheMoment,
        totalPausedToTheMoment: totalPausedToTheMoment,
        totalCancelledToTheMoment: totalCancelledToTheMoment,
      });
    })
    .then((createdEntry) => {
      // Handle successful creation
      console.log('New entry created:', createdEntry.toJSON());
    })
    .catch((error) => {
      // Handle error
      console.error('Error creating entry:', error);
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
  console.log(req.body);

  const query = `SELECT * FROM "subscriptionStateHistorics" WHERE 
    ((EXTRACT(YEAR FROM "createdAt") = ${req.body.year} 
    AND EXTRACT(MONTH FROM "createdAt") <= ${req.body.month} 
    AND (state = 'A' OR state = 'P')) 
    OR (EXTRACT(YEAR FROM "createdAt") = ${req.body.year} 
    AND EXTRACT(MONTH FROM "createdAt") = ${req.body.month}))`;

  try {
    const subsS = await db.sequelize.query(query);
     console.log("subsS", subsS)
     console.log("year", req.body.year)
     console.log("month", req.body.month)
     console.log("subsS", subsS)
    if (!subsS) {
      return res.status(404).send({ message: "SubsS by month not found" });
    }

    res.status(200).send(subsS[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

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

exports.getDashboardsInfo = async (req, res) => {
  
  try {
    const dashboardsInfo = initializeDarshboardInfo();
    
    const year = req.body.year;
    const actualYearFormatted = [year ].join('-');
    
    await getTransactionTotalByMonth(actualYearFormatted, dashboardsInfo);
    await getSubscriptionTotalAmountByMonth(dashboardsInfo);
    await getUsersQuantityByMonth(year, dashboardsInfo);
    await getAmountTotalByMode(actualYearFormatted, dashboardsInfo);

    await getSubsbyStateByMonth(year, dashboardsInfo);

    res.status(200).send(dashboardsInfo);

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

async function getSubsbyStateByMonth(year, dashboardsInfo) {
  let latestEntryByMonth = await SubscriptionStateHistoric.findAll({
    attributes: [
      'totalActiveToTheMoment',
      'totalPausedToTheMoment',
      'totalCancelledToTheMoment',
      [literal("DATE_FORMAT(createdAt, '%Y-%m')"), 'groupedPattern'],
      [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
    ],
    where: literal(`
        createdAt IN (
          SELECT MAX(createdAt) AS maxCreatedAt
          FROM subscriptionStateHistorics
          WHERE YEAR(createdAt) = ${year}
          GROUP BY YEAR(createdAt), MONTH(createdAt)
        )
      `),
  });

  let lastYearSubs = await SubscriptionStateHistoric.findAll({
    attributes: [
      'totalActiveToTheMoment',
      'totalPausedToTheMoment',
      'totalCancelledToTheMoment',
      [literal("DATE_FORMAT(createdAt, '%Y-%m')"), 'groupedPattern'],
      [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
    ],
    where: literal(`DATE_FORMAT(createdAt, '%Y-%m') LIKE '${year-1}-%'`),
    order: [[Sequelize.literal('createdAt'), 'DESC']],
    limit: 1,
  });

  if(lastYearSubs){
    for(let i = 1; i < latestEntryByMonth[0].dataValues.month; i++){
      dashboardsInfo.estadosSuscripciones[i] = {
        activas: lastYearSubs[0].dataValues.totalActiveToTheMoment,
        pausadas: lastYearSubs[0].dataValues.totalPausedToTheMoment,
        canceladas: lastYearSubs[0].dataValues.totalCancelledToTheMoment,
        total: lastYearSubs[0].dataValues.totalActiveToTheMoment + lastYearSubs[0].dataValues.totalPausedToTheMoment,
      };
    }
  }

  latestEntryByMonth = latestEntryByMonth.forEach((entry, index) => {
    if(index !== 0){
      let distancia = entry.dataValues.month - latestEntryByMonth[index - 1].dataValues.month;
      for(let i = 1; i < distancia; i++){
        let monthAux = latestEntryByMonth[index].dataValues.month - i;
        dashboardsInfo.estadosSuscripciones[monthAux] = {
          activas: latestEntryByMonth[index-1].dataValues.totalActiveToTheMoment,
          pausadas: latestEntryByMonth[index-1].dataValues.totalPausedToTheMoment,
          canceladas: latestEntryByMonth[index-1].dataValues.totalCancelledToTheMoment,
          total: latestEntryByMonth[index-1].dataValues.totalActiveToTheMoment + latestEntryByMonth[index-1].dataValues.totalPausedToTheMoment,
        };
      }
    }
    dashboardsInfo.estadosSuscripciones[entry.dataValues.month] = {
      activas: entry.dataValues.totalActiveToTheMoment,
      pausadas: entry.dataValues.totalPausedToTheMoment,
      canceladas: entry.dataValues.totalCancelledToTheMoment,
      total: entry.dataValues.totalActiveToTheMoment + entry.dataValues.totalPausedToTheMoment,
    };
  });


}

function addEntryToSubsStateHistory(subscription) {
  SubscriptionStateHistoric.findOne({
    order: [['createdAt', 'DESC']], // Fetch the latest entry based on createdAt column
  })
    .then((latestEntry) => {
      let totalActiveToTheMoment = latestEntry ? latestEntry.totalActiveToTheMoment: 0;
      let totalPausedToTheMoment = latestEntry ? latestEntry.totalPausedToTheMoment: 0;
      let totalCancelledToTheMoment = latestEntry ? latestEntry.totalCancelledToTheMoment: 0;

      // Create a new entry in SubscriptionStateHistoric table
      return SubscriptionStateHistoric.create({
        subscriptionId: subscription.id,
        state: "A",
        totalActiveToTheMoment: totalActiveToTheMoment+1,
        totalPausedToTheMoment: totalPausedToTheMoment,
        totalCancelledToTheMoment: totalCancelledToTheMoment,
      });
    })
    .then((createdEntry) => {
      // Handle successful creation
      console.log('New entry created:', createdEntry.toJSON());
    })
    .catch((error) => {
      // Handle error
      console.error('Error creating entry:', error);
    });
}

async function getUsersQuantityByMonth(year, dashboardsInfo) {
  let accumulatedUsersIncomplete = await User.findAll({
    attributes: [
      [Sequelize.literal("DATE_FORMAT(createdAt, '%Y-%m')"), "groupedPattern"],
      [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
      [
        Sequelize.literal(`(
            SELECT COUNT(*)
            FROM users AS u2
            WHERE DATE_FORMAT(u2.createdAt, '%Y-%m') <= DATE_FORMAT(users.createdAt, '%Y-%m')
          )`),
        'userCount'
      ]
    ],
    group: ['groupedPattern', 'userCount', 'month'],
    order: [Sequelize.literal("MIN(createdAt)")],
  });

  completeMissingMonths(accumulatedUsersIncomplete, year, dashboardsInfo);
}

async function getSubscriptionTotalAmountByMonth(dashboardsInfo) {
  let totalSubscriptionAmount = await Subscription.findAll({
    where: {
      nextPaymentDate: {
        [Op.gt]: Sequelize.literal('CURRENT_DATE()')
      }
    },
    include: [{
      model: SubscriptionState,
      attributes: [],
      where: { state: 'A' },
      required: true
    }],
    attributes: [
      [Sequelize.literal("DATE_FORMAT(nextPaymentDate, '%Y-%m')"), "groupedPattern"],
      [Sequelize.fn("SUM", Sequelize.col("amount")), "totalSubscriptionAmount"],
      [Sequelize.fn("MONTH", Sequelize.col("nextPaymentDate")), "month"]
    ],
    group: ["groupedPattern", "month"]
  });


  totalSubscriptionAmount = totalSubscriptionAmount.map((item) => {
    dashboardsInfo.montoSuscripciones[item.dataValues.month] = parseInt(item.dataValues.totalSubscriptionAmount, 10);
  });
}

async function getTransactionTotalByMonth(actualYearFormatted, dashboardsInfo) {
  let totalTransactionAmount = await Transaction.findAll({
    where: {
      paymentDate: { [Op.like]: `${actualYearFormatted}%`, }
    },
    include: [{
      model: TransactionState,
      attributes: [],
      where: { state: "A" },
      required: true
    }],
    attributes: [
      [literal(`DATE_FORMAT(paymentDate, '%Y-%m')`), "groupedPattern"],
      [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalTransactionAmount"],
      [Sequelize.fn('MONTH', Sequelize.col('paymentDate')), 'month']
    ],
    group: ['groupedPattern', 'month']
  });

  totalTransactionAmount.map((item) => {
    dashboardsInfo.montoTransacciones[item.dataValues.month] = parseInt(item.dataValues.totalTransactionAmount, 10);
  });
}

async function getAmountTotalByMode(actualYearFormatted, dashboardsInfo) {
  let totalAmountByMode = await await Transaction.findAll({
    where: {
      paymentDate: { [Op.like]: `${actualYearFormatted}%`, }
    },
    include: [{
      model: TransactionState,
      attributes: [],
      where: { state: "A" },
      required: true
    }],
    attributes: [
      [literal(`DATE_FORMAT(paymentDate, '%Y-%m')`), "groupedPattern"],
      [Sequelize.fn("SUM", Sequelize.cast(Sequelize.col("amount"), 'integer')), "totalAmountByMode"],
      [Sequelize.fn('MONTH', Sequelize.col('paymentDate')), 'month'],
      'type'
    ],
    group: ['groupedPattern', 'month', 'type']
  });

  totalAmountByMode.map((item) => {
    dashboardsInfo.montoPorModo[item.dataValues.month][item.dataValues.type] = parseInt(item.dataValues.totalAmountByMode, 10);
  });
}

function initializeDarshboardInfo() {
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


  const dashboardsInfo = {
    montoTransacciones: {},
    montoSuscripciones: {},
    estadosSuscripciones: {},
    cantidadUsuarios: {},
    montoPorModo:{},
  };

  months.forEach((month) => {
    dashboardsInfo.montoTransacciones[month] = 0;
    dashboardsInfo.montoSuscripciones[month] = 0;
    dashboardsInfo.estadosSuscripciones[month] = {
      activas: 0,
      canceladas: 0,
      pausadas: 0,
      total:0,
    };
    dashboardsInfo.cantidadUsuarios[month] = 0;
    dashboardsInfo.montoPorModo[month] = {
      onlyTime: 0,
      recurrent: 0,
    };
  });
  return dashboardsInfo;
}

function completeMissingMonths(unfilteredData, year, dashboardsInfo) {
  const result = [];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const indexOfFirstOfYear = unfilteredData.findIndex(obj => obj.dataValues.groupedPattern.startsWith(year));
  let prevUserCount = (indexOfFirstOfYear!==0) ? unfilteredData[indexOfFirstOfYear-1].dataValues.userCount : 0;
  
  const data = unfilteredData.filter((obj) => obj.dataValues.groupedPattern.startsWith(year))
  let dataIdx = 0;
  const maxIx = data.length - 1;

  months.forEach((month) => {
    const groupedPattern = `${year}-${String(month).padStart(2, '0')}`;

    if (data[dataIdx]?.dataValues.groupedPattern === groupedPattern) {
      prevUserCount = data[dataIdx].dataValues.userCount;
      dataIdx = Math.min(dataIdx + 1, maxIx);
    }

    dashboardsInfo.cantidadUsuarios[month] = prevUserCount;
  })

  return result;
}