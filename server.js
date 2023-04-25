const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());

//parse requests of content-type - application/json
app.use(express.json());
app.use((req, res, next ) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, DELETE, GET, OPTIONS')
  next()
})

//parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "patapila-session",
    secret: "COOKIE_SECRET", //should use as secret environment variable
    httpOnly: true,
    sameSite: 'strict'
  })
);

//database
const db = require("./app/models");

db.sequelize.sync();

//routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/payments.routes")(app);
require("./app/routes/milestones.routes")(app);
require("./app/routes/activities.routes")(app);
require("./app/routes/publicProfileURL.routes")(app);
require("./app/routes/image.routes")(app);
require("./app/routes/userInformation.routes")(app);
require("./app/routes/publicProfileInformation.routes")(app);

function filterSubs() {
  return axios.get(
    'http://localhost:8080/api/payment/filterSubscriptions',
  );
}

function pendingTransactions() {
  return axios.get(
    'http://localhost:8080/api/payment/getPendingTransactions',
  );
}

function createTransaction(amount,type,userId,subscriptionId) {
  return axios.post(
    'http://localhost:8080/api/payment/createTransaction',{
      amount,
      type,
      userId,
      subscriptionId
    }
  );
}
function changeNextDate(subscriptionId, nextPaymentDate, lastPaymentDate) {
  return axios.post(
    'http://localhost:8080/api/payment/modifySubscription',{
      subscriptionId, 
      nextPaymentDate, 
      lastPaymentDate
    }
  );
}

function modifyTransactionState(transactionId,state) {
  return axios.post(
    'http://localhost:8080/api/payment/modifyTransactionState',{
      transactionId,
      state
    }
  );
}

function countRecurrentTransactions() {
  return axios.post(
    'http://localhost:8080/api/payment/countRecurrentTransactions',
  );
}

function assingLongevityMilestone(userId,milestoneId) {
  return axios.post(
    'http://localhost:8080/api/milestone/assingLongevityMilestone',{
      userId,
      milestoneId
    }
  );
}

filterSubs().then(subs => {
  for( i in subs.data){
    var frequency = subs.data[i].frequency
    var paymentDate = subs.data[i].nextPaymentDate
    var now = new Date();
    if( frequency === 1){
      var current = new Date(now.setMonth(now.getMonth() + 1));
    }
    else if ( frequency === 2){
      var current = new Date(now.setMonth(now.getMonth() + 3));
    }
    else if (frequency === 3){
      var current = new Date(now.setMonth(now.getMonth() + 6));
    }
    else{
      var current = new Date(now.setMonth(now.getMonth() + 12));
    }
    var nextPaymentDate = current.toISOString().split('T')[0]
    changeNextDate(subs.data[i].id,nextPaymentDate,paymentDate).then(res => console.log(res.status))
    createTransaction(subs.data[i].amount,"recurrent",subs.data[i].userId,subs.data[i].id).then(res => console.log(res.status))
  
    axios.post("http://localhost:8080/api/activities/createActivity", {
      title: "Has realizado una donación gracias a tu suscripción!",
      description: "Gracias a tu suscripción has realizado una donación de $" + subs.data[i].amount + ".",
      userId: subs.data[i].userId,
    });    
  }
});

pendingTransactions().then(transactions =>{
  var value = 0
  for(i in transactions.data){
    if(value === 0){
      modifyTransactionState(transactions.data[i].transactionId,"A").then(res => console.log(res.status))
      value = 1
    }
    else{
      modifyTransactionState(transactions.data[i].transactionId,"R").then(res => console.log(res.status))
      value = 0
    }
  }
})
countRecurrentTransactions().then(res => {
  console.log(res.data)
  for(i in res.data){
    if(res.data[i].count == 6){
      assingLongevityMilestone(res.data[i].userId,3).then(res => console.log(res.status))
    }
    else if(res.data[i].count == 12){
      assingLongevityMilestone(res.data[i].userId,4).then(res => console.log(res.status))
    }
    else{
      console.log(res.data[i].count)
     }
   }
 })

//set port, listen for requests
let port=process.env.PORT||8080;
app.listen(port, () => {
    console.log(`App running on port ${port} `);
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))


//token recieve
app.get('/verify/:token', (req, res)=>{
	const {token} = req.params;

//Verifing the JWT token
	jwt.verify(token, 'ourSecretKey', function(err) {
		if (err) {
			console.log(err);
			res.send("La verificación del email fallo, posiblemente el link es invalido o ha expirado");
		}
		else {
			res.redirect(`http://localhost:3000/resetPassword/${1}/${token}`); 
		}
	});
});
