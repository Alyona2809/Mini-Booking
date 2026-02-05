"use strict";

module.exports = {
  async up(queryInterface) {
    const hotels = await queryInterface.sequelize.query(
      `SELECT id from "Hotels";`
    );
    const hotelRows = hotels[0];

    await queryInterface.bulkInsert("Rooms", [
      {
        hotelId: hotelRows[0].id,
        roomNumber: "101",
        type: "standard",
        pricePerNight: 100.0,
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        hotelId: hotelRows[0].id,
        roomNumber: "102",
        type: "deluxe",
        pricePerNight: 150.0,
        capacity: 3,
        amenities: "WiFi, TV, Mini-bar, Jacuzzi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        hotelId: hotelRows[0].id,
        roomNumber: "201",
        type: "suite",
        pricePerNight: 250.0,
        capacity: 4,
        amenities: "WiFi, TV, Mini-bar, Jacuzzi, Living room",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        hotelId: hotelRows[1].id,
        roomNumber: "301",
        type: "standard",
        pricePerNight: 120.0,
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar, Ocean view",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        hotelId: hotelRows[1].id,
        roomNumber: "302",
        type: "ocean_view",
        pricePerNight: 200.0,
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar, Ocean view, Balcony",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        hotelId: hotelRows[1].id,
        roomNumber: "401",
        type: "penthouse",
        pricePerNight: 350.0,
        capacity: 6,
        amenities: "WiFi, TV, Mini-bar, Ocean view, Balcony, Private pool",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Rooms", null, {});
  },
};
