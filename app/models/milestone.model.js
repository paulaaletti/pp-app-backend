module.exports = (sequelize, Sequelize) => {
    const Milestone = sequelize.define("milestone", {
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      }
    });
    return Milestone;
  };