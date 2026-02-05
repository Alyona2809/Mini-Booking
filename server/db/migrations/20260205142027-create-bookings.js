"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Rooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      guestName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      guestEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      checkInDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      checkOutDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "confirmed",
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Bookings", ["roomId"]);
    await queryInterface.addIndex("Bookings", ["status"]);
    await queryInterface.addIndex("Bookings", ["checkInDate", "checkOutDate"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Bookings");
  },
};
