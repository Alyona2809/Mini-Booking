"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("Rooms", ["hotelId", "roomNumber"], {
      unique: true,
      name: "rooms_hotelId_roomNumber_unique",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "Bookings"
      ADD CONSTRAINT "bookings_checkOut_after_checkIn"
      CHECK ("checkOutDate" > "checkInDate");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Bookings"
      DROP CONSTRAINT IF EXISTS "bookings_checkOut_after_checkIn";
    `);
    await queryInterface.removeIndex(
      "Rooms",
      "rooms_hotelId_roomNumber_unique"
    );
  },
};
