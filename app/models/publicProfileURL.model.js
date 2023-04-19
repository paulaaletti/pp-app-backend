module.exports = (sequelize, Sequelize) => {
    const PublicProfileURL = sequelize.define("publicProfileURL", {
      url: {
        type: Sequelize.STRING,
      },
    });
    return PublicProfileURL;
  };