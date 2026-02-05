'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      this.belongsTo(models.Room, { foreignKey: 'roomId' });
    }
  }
  
  Booking.init({
    roomId: DataTypes.INTEGER,
    guestName: DataTypes.STRING,
    guestEmail: DataTypes.STRING,
    checkInDate: DataTypes.DATEONLY,
    checkOutDate: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    totalPrice: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Booking',
  });
  
  return Booking;
};