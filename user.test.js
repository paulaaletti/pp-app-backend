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

test('should fail to log user with empty data', async () => {
  const res = await axios.post('http://localhost:8080/api/auth/signin',{}
  ).catch(e =>{//en caso de esperar un error lo capturamos con un catch
    expect(e.response.status).toEqual(500)
    expect(e.response.data.message).toBe("WHERE parameter \"email\" has invalid \"undefined\" value")
  })
})
test('should fail to create user with duplicated email', async () => {
  const res = await axios.post('http://localhost:8080/api/auth/signup',{
    email: "user@gmail.com"
  }
  ).catch(e =>{//en caso de esperar un error lo capturamos con un catch
    expect(e.response.status).toEqual(400)
    expect(e.response.data.message).toBe('Ya existe una cuenta asociada a ese email!')
  })
})

test('should fail to create user with ivalid roles', async() => {
  const res = await axios.post('http://localhost:8080/api/auth/signup',{
    email: "userNoRepetido@gmail.com",
    name: "User de prueba",
    lastname: "User de prueba",
    roles: ["no existo"]}).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe('Failed! Role does not exist = no existo')
    })
})

test('should fail to create user with empty fields', async() => {
  const res = await axios.post('http://localhost:8080/api/auth/signup',{
    email: "",
    name: "",
    lastname: "",
    password: ""
  }).catch(e =>{
      expect(e.response.status).toEqual(400)
      expect(e.response.data.message).toBe("No puede haber campos vacíos!")
    })
})

test('user shoul fail to login with invalid password', async() => {
  const res = await axios.post('http://localhost:8080/api/auth/signin',{
    email: "user@gmail.com",
    password: "noEsMiPasword"
  }).catch(e =>{
      expect(e.response.status).toEqual(401)
      expect(e.response.data.message).toBe("Contraseña incorrecta!")
    })
})

test('user shoul fail to login with invailid email', async() => {
  const res = await axios.post('http://localhost:8080/api/auth/signin',{
    email: "noUser@gmail.com",
    password: "noEsMiPasword"
  }).catch(e =>{
      expect(e.response.status).toEqual(404)
      expect(e.response.data.message).toBe("User Not found.")
    })
})

test('user shoul fail to login with valid password', async() => {
  const res = await axios.post('http://localhost:8080/api/auth/signin',{
    email: "user@gmail.com",
    password: "user123"})
  expect(res.status).toEqual(200)
  expect(res.data).toHaveProperty('accessToken')
  expect(res.data).toHaveProperty('id')
  expect(res.data).toHaveProperty('email')
  expect(res.data).toHaveProperty('name')
  expect(res.data).toHaveProperty('lastname')
  expect(res.data).toHaveProperty('roles')
  expect(res.data).toHaveProperty('refreshToken')
})