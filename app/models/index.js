const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
/* const sequelize = new Sequelize('postgres://wtukelbehxinsv:d49ff7b066783cae788b94cab4b23d673cd689b8c3c8bb12fc80de824f73b503@ec2-3-220-207-90.compute-1.amazonaws.com:5432/dai8n8nsdbani8', {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
}
}); */
/* const sequelize = new Sequelize(
  'ppdb',
  'doadmin',
  'AVNS_Kc7CdsqakD6F6NqTQnM',
   {
     host: 'patapila-bd-do-user-13800627-0.b.db.ondigitalocean.com',
     dialect: 'mysql'
   }
 ); */
const sequelize = new Sequelize('mysql://doadmin:AVNS_Kc7CdsqakD6F6NqTQnM@patapila-bd-do-user-13800627-0.b.db.ondigitalocean.com:25060/ppdb');
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.subscription = require("../models/subscription.model.js")(sequelize, Sequelize);
db.subscriptionState = require("../models/subscriptionState.model.js")(sequelize, Sequelize);
db.transaction = require("../models/transaction.model.js")(sequelize, Sequelize);
db.transactionState = require("../models/transactionState.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);
db.changePasswordToken = require("../models/changePasswordToken.model.js")(sequelize, Sequelize);
db.subscriptionStateHistoric = require("../models/subscriptionStateHistoric.model.js")(sequelize, Sequelize);
db.milestone = require("./milestone.model.js")(sequelize, Sequelize);
db.activity = require("./activity.model.js")(sequelize, Sequelize);
//db.event = require("../models/event.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.user.belongsToMany(db.user, {
  through: "UserReferred",
  as: "ReferrerUser",
  foreignKey: "ReferrerUserId"
});
db.user.belongsToMany(db.user, {
  through: "UserReferred",
  as: "ReferredUser",
  foreignKey: "ReferredUserId"
});
db.subscription.belongsTo(db.user,{
  foreignKey: 'userId', targetKey: 'id'
});
db.subscriptionState.belongsTo(db.subscription,{
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.milestone.belongsToMany(db.user, {
  through: "user_milestones",
  foreignKey: "milestoneId",
  otherKey: "userId"
});
db.user.belongsToMany(db.milestone, {
  through: "user_milestones",
  foreignKey: "userId",
  otherKey: "milestoneId"
});
db.activity.belongsTo(db.user,{
  foreignKey: 'userId', targetKey: 'id'
});
db.subscriptionStateHistoric.belongsTo(db.subscription,{
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.transaction.belongsTo(db.user,{
  foreignKey: 'userId', targetKey: 'id'
});
db.transactionState.belongsTo(db.transaction,{
  foreignKey: 'transactionId', targetKey: 'id'
});
db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});
db.transaction.belongsTo(db.subscription, {
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.changePasswordToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});
db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', targetKey: 'id'
});
db.subscription.hasOne(db.transaction, {
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.user.hasOne(db.changePasswordToken, {
  foreignKey: 'userId', targetKey: 'id'
});
db.user.hasOne(db.subscription, {
  foreignKey: 'userId', targetKey: 'id'
});
db.user.hasOne(db.transaction, {
  foreignKey: 'userId', targetKey: 'id'
});
db.subscription.hasOne(db.subscriptionState, {
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.user.hasMany(db.activity, {
  foreignKey: 'userId', targetKey: 'id'
});
db.subscription.hasMany(db.subscriptionStateHistoric, {
  foreignKey: 'subscriptionId', targetKey: 'id'
});
db.transaction.hasOne(db.transactionState, {
  foreignKey: 'transactionId', targetKey: 'id'
});
db.ROLES = ["user", "admin"];
module.exports = db;
