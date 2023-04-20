
const {DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define('Image', {
    image: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  });
  return Image;
};
