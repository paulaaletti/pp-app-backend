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

test('should return all pending transactions', async () => {
    const res = await axios.get('http://localhost:8080/api/payment/getPendingTransactions').catch(e =>{
        expect(e.response.status).toEqual(404)
        expect(e.response.data.message).toBe('Pending transactions not found')
      })
      expect(res.status).toEqual(200)
      expect(res.data).toBeInstanceOf(Array)
  })
test('should not create a transaction', async () => { 
    const res = await axios.post('http://localhost:8080/api/payment/createTransaction',{}).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Empty request')
    })
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
      transactionId: 91
    }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Invalid state modification.')
    })
})

test('should fail to create transaction with ivalid user id', async () => {
    const res = await axios.post('http://localhost:8080/api/payment/createTransaction',{
      userId: "1",
      amount: 100,
      paymentDate: "2021-06-10",
      type: "onlyTime"
    }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe("userid debe ser un entero válido.")
    })
})

test('should fail to create transaction with inexisting user id', async () => {
    const res = await axios.post('http://localhost:8080/api/payment/createTransaction',{
      userId: 0,
      amount: 100,
      type: "onlyTime"
    }).catch(e =>{
      expect(e.response.status).toEqual(500)
      expect(e.response.data.message).toBe("insert or update on table \"transactions\" violates foreign key constraint \"transactions_userId_fkey\"")
    })
})

test('should fail to create transaction with negative amount', async () => {
    const res = await axios.post('http://localhost:8080/api/payment/createTransaction',{
      userId: 5,
      amount: -100,
      type: "onlyTime"
    }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe(" El monto es inválido.")
    })
})