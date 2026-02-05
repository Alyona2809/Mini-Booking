const { GraphQLError } = require("graphql");

const { DateScalar, isValidDateOnly } = require("./scalars/date");

function toUtcMidnight(dateOnly) {
  // dateOnly is YYYY-MM-DD
  return new Date(`${dateOnly}T00:00:00.000Z`);
}

function diffNights(checkInDate, checkOutDate) {
  const start = toUtcMidnight(checkInDate);
  const end = toUtcMidnight(checkOutDate);
  return Math.round((end - start) / 86400000);
}

function assertValidRange(start, end) {
  if (!isValidDateOnly(start) || !isValidDateOnly(end)) {
    throw new GraphQLError("Неверный формат даты. Используй YYYY-MM-DD.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if (start >= end) {
    throw new GraphQLError(
      "Неверный диапазон дат: дата окончания должна быть позже даты начала.",
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }
}

function notFound(message) {
  return new GraphQLError(message, { extensions: { code: "NOT_FOUND" } });
}

function conflict(message, extra = {}) {
  return new GraphQLError(message, {
    extensions: { code: "CONFLICT", ...extra },
  });
}

const resolvers = {
  Date: DateScalar,

  Query: {
    hotels: async (_parent, _args, { db }) =>
      db.Hotel.findAll({ order: [["id", "ASC"]] }),
    hotel: async (_parent, { id }, { db }) => db.Hotel.findByPk(id),

    rooms: async (_parent, { hotelId }, { db }) => {
      const where = hotelId ? { hotelId } : undefined;
      return db.Room.findAll({
        where,
        order: [
          ["hotelId", "ASC"],
          ["roomNumber", "ASC"],
        ],
      });
    },

    room: async (_parent, { id }, { db }) => db.Room.findByPk(id),

    roomBookings: async (_parent, { roomId, status }, { db }) => {
      const where = { roomId };
      if (status) where.status = status;
      return db.Booking.findAll({
        where,
        order: [
          ["checkInDate", "ASC"],
          ["checkOutDate", "ASC"],
        ],
      });
    },

    roomAvailability: async (
      _parent,
      { roomId, startDate, endDate },
      { db }
    ) => {
      assertValidRange(startDate, endDate);

      const room = await db.Room.findByPk(roomId);
      if (!room) throw notFound("Номер не найден.");

      const { Op } = db.Sequelize;
      const conflicts = await db.Booking.findAll({
        where: {
          roomId,
          status: "confirmed",
          checkInDate: { [Op.lt]: endDate },
          checkOutDate: { [Op.gt]: startDate },
        },
        order: [
          ["checkInDate", "ASC"],
          ["checkOutDate", "ASC"],
        ],
      });

      return { available: conflicts.length === 0, conflicts };
    },
  },

  Mutation: {
    createBooking: async (_parent, { input }, { db }) => {
      const { roomId, guestName, guestEmail, checkInDate, checkOutDate } =
        input;
      const notes = input.notes ?? "";

      assertValidRange(checkInDate, checkOutDate);
      if (!guestName?.trim()) {
        throw new GraphQLError("Поле guestName обязательно.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (!guestEmail?.trim()) {
        throw new GraphQLError("Поле guestEmail обязательно.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const nights = diffNights(checkInDate, checkOutDate);
      if (nights <= 0) {
        throw new GraphQLError("Неверный диапазон дат.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const { Op } = db.Sequelize;

      return db.sequelize.transaction(async (transaction) => {
        // Лочим строку Room, чтобы избежать гонок createBooking для одной комнаты
        const room = await db.Room.findByPk(roomId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!room) throw notFound("Номер не найден.");

        const existing = await db.Booking.findOne({
          transaction,
          lock: transaction.LOCK.UPDATE,
          where: {
            roomId,
            status: "confirmed",
            checkInDate: { [Op.lt]: checkOutDate },
            checkOutDate: { [Op.gt]: checkInDate },
          },
          order: [["checkInDate", "ASC"]],
        });

        if (existing) {
          throw conflict("Даты брони пересекаются с существующей бронью.", {
            conflictBookingId: String(existing.id),
          });
        }

        const pricePerNight = Number.parseFloat(room.pricePerNight);
        if (Number.isNaN(pricePerNight)) {
          throw new GraphQLError("У номера некорректная цена pricePerNight.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        const totalPrice = (pricePerNight * nights).toFixed(2);

        const booking = await db.Booking.create(
          {
            roomId,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim(),
            checkInDate,
            checkOutDate,
            status: "confirmed",
            totalPrice,
            notes,
          },
          { transaction }
        );

        // eslint-disable-next-line no-console
        console.log(
          `[booking:create] id=${booking.id} roomId=${roomId} ${checkInDate}..${checkOutDate} guest=${booking.guestEmail}`
        );

        return booking;
      });
    },

    cancelBooking: async (_parent, { id }, { db }) =>
      db.sequelize.transaction(async (transaction) => {
        const booking = await db.Booking.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!booking) throw notFound("Бронь не найдена.");

        if (booking.status === "cancelled") {
          throw new GraphQLError("Бронь уже отменена.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        booking.status = "cancelled";
        await booking.save({ transaction });

        // eslint-disable-next-line no-console
        console.log(
          `[booking:cancel] id=${booking.id} roomId=${booking.roomId}`
        );

        return booking;
      }),
  },

  Hotel: {
    rooms: async (hotel, _args, { db }) =>
      db.Room.findAll({
        where: { hotelId: hotel.id },
        order: [["roomNumber", "ASC"]],
      }),
  },

  Room: {
    hotel: async (room, _args, { db }) => db.Hotel.findByPk(room.hotelId),
    bookings: async (room, { status }, { db }) => {
      const where = { roomId: room.id };
      if (status) where.status = status;
      return db.Booking.findAll({
        where,
        order: [
          ["checkInDate", "ASC"],
          ["checkOutDate", "ASC"],
        ],
      });
    },
  },

  Booking: {
    room: async (booking, _args, { db }) => db.Room.findByPk(booking.roomId),
    createdAt: (booking) =>
      booking.createdAt && typeof booking.createdAt.toISOString === "function"
        ? booking.createdAt.toISOString()
        : String(booking.createdAt),
    updatedAt: (booking) =>
      booking.updatedAt && typeof booking.updatedAt.toISOString === "function"
        ? booking.updatedAt.toISOString()
        : String(booking.updatedAt),
  },
};

module.exports = { resolvers };
