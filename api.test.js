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
//se corren los tests con el comando npm test
//para crear otra suite solo se debe crear un archivo con el nombre-de-la-suite.test.js
app.use(express.urlencoded({ extended: true }));
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/payments.routes")(app);

test('should return all users', async () => {
  const res = await axios.get('http://localhost:8080/api/test/all');
  expect(res.status).toEqual(200)
  expect(res).toHaveProperty('data')//si no esperamos un error no hay necesidad de utilizar catch
  expect(res.data).toBe('Public Content.')
})

test('should return user board', async () => {
  
  const res = await axios.get('http://localhost:8080/api/test/user').catch(e =>{
    expect(e.response.status).toEqual(403)
    expect(e.message).toBe('Request failed with status code 403')
    expect(e.response.data.message).toBe('No token provided!')
  })
})

test('should return admin board', async () => {
  const res = await axios.get('http://localhost:8080/api/test/admin').catch(e =>{
    expect(e.response.status).toEqual(403)
    expect(e.message).toBe('Request failed with status code 403')
    expect(e.response.data.message).toBe('No token provided!')})
})

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

test('should return all pending transactions', async () => {
  const res = await axios.get('http://localhost:8080/api/payment/getPendingTransactions').catch(e =>{
      expect(e.response.status).toEqual(404)
      expect(e.response.data.message).toBe('Pending transactions not found')
    })
    expect(res.status).toEqual(200)
    expect(res.data).toBeInstanceOf(Array)
})

test('should create a transaction', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/createTransaction',{}).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Empty request')
    })
})

test('should modify subscription state', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/modifySubscriptionState',{
      subscriptionId: 2,
      state: "A"
    })
    expect(res.status).toEqual(200)
    expect(res.data.message).toBe('Subscription state modified successfully!')
})

test('should fail to find transaction', async () => { 
  const res = await axios.post('http://localhost:8080/api/payment/modifyTransactionState',{
    state: "P",
    transactionId: 0
  }).catch(e =>{
    expect(e.response.status).toEqual(404)
    expect(e.response.data.message).toBe('Transaction Not found.')
  })
})

test('should fail to modify transaction state', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/modifyTransactionState',{
      state: "P",
      transactionId: 1
    }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Invalid state modification.')
    })
})

test('should fail to create subscription with invalid userId', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: "300",
    frequency: 4,
    amount: 1000,
    nextPaymentDate: "2021-01-01",
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe('userid debe ser un entero.')
  })
})

test('should fail to create subscription with invalid frequency', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: 3,
    frequency: 5,
    amount: 1000,
    nextPaymentDate: "2021-01-01",
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe(' La frecuencia es inválida.')
  })
})

test('should fail to create subscription with invalid frequency type', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: 3,
    frequency: "1",
    amount: 1000,
    nextPaymentDate: "2021-01-01",
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe(' La frecuencia es inválida.')
  })
})

test('should fail to create subscription with invalid amount', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: 3,
    frequency: 1,
    amount: -1,
    nextPaymentDate: "2021-01-01",
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe(' El monto es inválido.')
  })
})

test('should fail to create subscription with invalid amount type', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: 3,
    frequency: 1,
    amount: "1000",
    nextPaymentDate: "2021-01-01",
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe(' El monto es inválido.')
  })
})

test('should fail to create subscription with invalid date type', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: 3,
    frequency: 1,
    amount: 100,
    nextPaymentDate: 4,
  }).catch(e =>{
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe(' La fecha de pago es inválida.')
  })
})

test('should fail to create subscription with invalid data', async () => {
  const res = await axios.post('http://localhost:8080/api/payment/createSubscription',{
    userId: "3",
    frequency: -1,
    amount: 0,
    nextPaymentDate: 4,
  }).catch(e =>{//en caso de esperar un error lo capturamos con un catch
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe('userid debe ser un entero. La frecuencia es inválida. La fecha de pago es inválida.')
  })
})