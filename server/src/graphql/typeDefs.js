const typeDefs = `
  scalar Date

  type Hotel {
    id: ID!
    name: String!
    address: String!
    description: String
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    hotelId: Int!
    roomNumber: String!
    type: String!
    pricePerNight: String!
    capacity: Int!
    amenities: String

    hotel: Hotel!
    bookings(status: BookingStatus): [Booking!]!
  }

  enum BookingStatus {
    confirmed
    cancelled
  }

  type Booking {
    id: ID!
    roomId: Int!
    guestName: String!
    guestEmail: String!
    checkInDate: Date!
    checkOutDate: Date!
    status: BookingStatus!
    totalPrice: String!
    notes: String
    createdAt: String!
    updatedAt: String!

    room: Room!
  }

  type AvailabilityResult {
    available: Boolean!
    conflicts: [Booking!]!
  }

  input CreateBookingInput {
    roomId: Int!
    guestName: String!
    guestEmail: String!
    checkInDate: Date!
    checkOutDate: Date!
    notes: String
  }

  type Query {
    hotels: [Hotel!]!
    hotel(id: ID!): Hotel

    rooms(hotelId: Int): [Room!]!
    room(id: ID!): Room

    roomBookings(roomId: Int!, status: BookingStatus): [Booking!]!
    roomAvailability(roomId: Int!, startDate: Date!, endDate: Date!): AvailabilityResult!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
  }
`;

module.exports = { typeDefs };

