const userRoutes = require("./app/routes/user.routes")
const paymetsRoutes = require("./app/routes/payments.routes")
const express = require("express");
const cors = require("cors");
const axios = require('axios');
const { request } = require("express");

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/payments.routes")(app);

test('should return all users', async () => {
  const res = await axios.get('https://pp-app-backend.herokuapp.com/api/test/all');
  expect(res.status).toEqual(200)
  expect(res).toHaveProperty('data')
  expect(res.data).toBe('Public Content.')
})

test('should return user board', async () => {
  
  const res = await axios.get('https://pp-app-backend.herokuapp.com/api/test/user').catch(e =>{
    expect(e.response.status).toEqual(403)
    expect(e.message).toBe('Request failed with status code 403')
    expect(e.response.data.message).toBe('No token provided!')
  })
})

test('should return admin board', async () => {
  const res = await axios.get('https://pp-app-backend.herokuapp.com/api/test/admin').catch(e =>{
    expect(e.response.status).toEqual(403)
    expect(e.message).toBe('Request failed with status code 403')
    expect(e.response.data.message).toBe('No token provided!')})
})

test('should return all subscriptions', async () => { 
    const res = await axios.post('https://pp-app-backend.herokuapp.com/api/payment/getSubscriptions',{
      limit: 10,
      offset: 0
    }).catch(e =>{
      expect(e.response.status).toEqual(404)
      expect(e.response.data.message).toBe('"Subscriptions not found"')
    })
    expect(res.status).toEqual(200)
})

test('should return all pending transactions', async () => {
  const res = await axios.get('https://pp-app-backend.herokuapp.com/api/payment/getPendingTransactions').catch(e =>{
      expect(e.response.status).toEqual(404)
      expect(e.response.data.message).toBe('Pending transactions not found')
    })
    expect(res.status).toEqual(200)
    expect(res.data).toBeInstanceOf(Array)
})

test('should create a transaction', async () => { 
    const res = await axios.post('https://pp-app-backend.herokuapp.com/api/payment/createTransaction',{}).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Empty request')
    })
})

test('should modify subscription state', async () => { 
    const res = await axios.post('https://pp-app-backend.herokuapp.com/api/payment/modifySubscriptionState',{
      subscriptionId: 80,
      state: "A"
    })
    expect(res.status).toEqual(200)
    expect(res.data.message).toBe('Subscription state modified successfully!')
})

test('should fail to find transaction', async () => { 
  const res = await axios.post('https://pp-app-backend.herokuapp.com/api/payment/modifyTransactionState',{
    state: "P",
    transactionId: 0
  }).catch(e =>{
    expect(e.response.status).toEqual(404)
    expect(e.response.data.message).toBe('Transaction Not found.')
  })
})

test('should fail to modify transaction state', async () => { 
    const res = await axios.post('https://pp-app-backend.herokuapp.com/api/payment/modifyTransactionState',{
      state: "P",
      transactionId: 35
    }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Invalid state modification.')
    })
})

