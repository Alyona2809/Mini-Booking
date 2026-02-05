"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    static associate(models) {
      this.hasMany(models.Room, { foreignKey: "hotelId" });
    }
  }

  Hotel.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Hotel",
    }
  );

  return Hotel;
};
