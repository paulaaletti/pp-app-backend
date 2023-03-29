module.exports = {
    LOCALDB_HOST: "127.0.0.1",
    LOCALDB_USER: "root",
    LOCALDB_PASSWORD: "123456",//password de la bd como user root
    LOCALDB_DB: "PPDB",//nombre de la bd

    HOST: "patapila-bd-do-user-13800627-0.b.db.ondigitalocean.com",
    USER: "doadmin",
    PORT: 25060,
    PASSWORD: "AVNS_Kc7CdsqakD6F6NqTQnM",
    DB: "ppdb",
    SSL: "true",

    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  };