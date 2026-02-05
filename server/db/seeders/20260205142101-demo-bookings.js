"use strict";

module.exports = {
  async up(queryInterface) {
    const rooms = await queryInterface.sequelize.query(
      `SELECT id from "Rooms";`
    );
    const roomRows = rooms[0];

    const toDateOnly = (d) => d.toISOString().slice(0, 10);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekPlusTwo = new Date(today);
    nextWeekPlusTwo.setDate(nextWeekPlusTwo.getDate() + 9);

    await queryInterface.bulkInsert("Bookings", [
      {
        roomId: roomRows[0].id,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        checkInDate: toDateOnly(tomorrow),
        checkOutDate: toDateOnly(dayAfterTomorrow),
        status: "confirmed",
        totalPrice: 200.0,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roomId: roomRows[0].id,
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        checkInDate: toDateOnly(nextWeek),
        checkOutDate: toDateOnly(nextWeekPlusTwo),
        status: "confirmed",
        totalPrice: 200.0,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roomId: roomRows[1].id,
        guestName: "Bob Johnson",
        guestEmail: "bob@example.com",
        checkInDate: toDateOnly(tomorrow),
        checkOutDate: toDateOnly(dayAfterTomorrow),
        status: "cancelled",
        totalPrice: 300.0,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Bookings", null, {});
  },
};
