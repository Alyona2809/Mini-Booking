"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Hotels", [
      {
        name: "Grand Hotel",
        address: "123 Main St, New York",
        description: "Luxury 5-star hotel in downtown",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Seaside Resort",
        address: "456 Beach Rd, Miami",
        description: "Beachfront resort with ocean views",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Hotels", null, {});
  },
};
