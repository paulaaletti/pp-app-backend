module.exports = {
    HOST: "127.0.0.1",
    USER: "root",
    PASSWORD: "123456",//password de la bd como user root
    DB: "PPDB",//nombre de la bd
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  };