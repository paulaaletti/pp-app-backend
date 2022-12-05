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
  