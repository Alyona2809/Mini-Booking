"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      this.belongsTo(models.Hotel, { foreignKey: "hotelId" });
      this.hasMany(models.Booking, { foreignKey: "roomId" });
    }
  }

  Room.init(
    {
      hotelId: DataTypes.INTEGER,
      roomNumber: DataTypes.STRING,
      type: DataTypes.STRING,
      pricePerNight: DataTypes.DECIMAL(10, 2),
      capacity: DataTypes.INTEGER,
      amenities: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Room",
    }
  );

  return Room;
};
