module.exports = {
    LOCALDB_HOST: "127.0.0.1",
    LOCALDB_USER: "root",
    LOCALDB_PASSWORD: "1234",//password de la bd como user root
    LOCALDB_DB: "PPDB",//nombre de la bd
    LOCALDB_PORT: 3306,

    HOST: "db-mysql-pp-do-user-13800627-0.b.db.ondigitalocean.com",
    USER: "doadmin",
    PORT: 25060,
    PASSWORD: "AVNS__KFqanuHaZA8Km3g5rT",
    DB: "defaultdb",
    SSL: "true",

    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  };