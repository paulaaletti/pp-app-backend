const express = require("express");
const cors = require("cors");
const axios = require('axios');

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
//se corren los tests con el comando npm test
//para crear otra suite solo se debe crear un archivo con el nombre-de-la-suite.test.js
app.use(express.urlencoded({ extended: true }));
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/payments.routes")(app);

test('should return all subscriptions', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/getSubscriptions',{
      limit: 10,
      offset: 0
    }).catch(e =>{
      expect(e.response.status).toEqual(404)
      expect(e.response.data.message).toBe('"Subscriptions not found"')
    })
    expect(res.status).toEqual(200)
})
test('should modify subscription state', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/modifySubscriptionState',{
      subscriptionId: 2,
      state: "A"
    })
    expect(res.status).toEqual(200)
    expect(res.data.message).toBe('Subscription state modified successfully!')
})

test('should get subscription', async () => {
    const res = await axios.post('http://localhost:8080/api/payment/getSubscription',{
        userId: 2
    })
    expect(res.status).toEqual(200)
})

test('should fail to create subscription with invalid userId', async () => {
  })
test('should fail to create subscription with invalid frequency type', async () => {
  })
  
  test('should fail to create subscription with invalid amount', async () => {
  })
  
  test('should fail to create subscription with invalid amount type', async () => {
  })
  
  test('should fail to create subscription with invalid date type', async () => {
  })

  test('should fail to create subscription with invalid frequency', async () => {
  })

test('should fail to create subscription with invalid data', async () => {
  })
  