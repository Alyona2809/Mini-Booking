function toDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

async function seedDemoDataIfEmpty(db) {
  const hotelsCount = await db.Hotel.count();
  if (hotelsCount > 0) return { seeded: false };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekPlusTwo = new Date(today);
  nextWeekPlusTwo.setDate(nextWeekPlusTwo.getDate() + 9);

  return db.sequelize.transaction(async (transaction) => {
    const [grandHotel] = await db.Hotel.findOrCreate({
      transaction,
      where: { name: "Grand Hotel" },
      defaults: {
        address: "123 Main St, New York",
        description: "Luxury 5-star hotel in downtown",
      },
    });

    const [seasideResort] = await db.Hotel.findOrCreate({
      transaction,
      where: { name: "Seaside Resort" },
      defaults: {
        address: "456 Beach Rd, Miami",
        description: "Beachfront resort with ocean views",
      },
    });

    const rooms = [
      {
        hotelId: grandHotel.id,
        roomNumber: "101",
        type: "standard",
        pricePerNight: "100.00",
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar",
      },
      {
        hotelId: grandHotel.id,
        roomNumber: "102",
        type: "deluxe",
        pricePerNight: "150.00",
        capacity: 3,
        amenities: "WiFi, TV, Mini-bar, Jacuzzi",
      },
      {
        hotelId: grandHotel.id,
        roomNumber: "201",
        type: "suite",
        pricePerNight: "250.00",
        capacity: 4,
        amenities: "WiFi, TV, Mini-bar, Jacuzzi, Living room",
      },
      {
        hotelId: seasideResort.id,
        roomNumber: "301",
        type: "standard",
        pricePerNight: "120.00",
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar, Ocean view",
      },
      {
        hotelId: seasideResort.id,
        roomNumber: "302",
        type: "ocean_view",
        pricePerNight: "200.00",
        capacity: 2,
        amenities: "WiFi, TV, Mini-bar, Ocean view, Balcony",
      },
      {
        hotelId: seasideResort.id,
        roomNumber: "401",
        type: "penthouse",
        pricePerNight: "350.00",
        capacity: 6,
        amenities: "WiFi, TV, Mini-bar, Ocean view, Balcony, Private pool",
      },
    ];

    const createdRooms = [];
    for (const room of rooms) {
      const [created] = await db.Room.findOrCreate({
        transaction,
        where: { hotelId: room.hotelId, roomNumber: room.roomNumber },
        defaults: room,
      });
      createdRooms.push(created);
    }

    const bookingsCount = await db.Booking.count({ transaction });
    if (bookingsCount === 0) {
      // Демо-брони: 2 активные на одну комнату в разные даты (для демонстрации конфликтов),
      // плюс одна отменённая на другую.
      await db.Booking.bulkCreate(
        [
          {
            roomId: createdRooms[0].id,
            guestName: "John Doe",
            guestEmail: "john@example.com",
            checkInDate: toDateOnly(tomorrow),
            checkOutDate: toDateOnly(dayAfterTomorrow),
            status: "confirmed",
            totalPrice: "200.00",
            notes: "",
          },
          {
            roomId: createdRooms[0].id,
            guestName: "Jane Smith",
            guestEmail: "jane@example.com",
            checkInDate: toDateOnly(nextWeek),
            checkOutDate: toDateOnly(nextWeekPlusTwo),
            status: "confirmed",
            totalPrice: "200.00",
            notes: "",
          },
          {
            roomId: createdRooms[1].id,
            guestName: "Bob Johnson",
            guestEmail: "bob@example.com",
            checkInDate: toDateOnly(tomorrow),
            checkOutDate: toDateOnly(dayAfterTomorrow),
            status: "cancelled",
            totalPrice: "300.00",
            notes: "",
          },
        ],
        { transaction }
      );
    }

    return { seeded: true };
  });
}

module.exports = { seedDemoDataIfEmpty };

