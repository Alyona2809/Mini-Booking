const hotelsQuery = r'''
query Hotels {
  hotels {
    id
    name
    address
    description
    rooms {
      id
      roomNumber
      type
      pricePerNight
      capacity
    }
  }
}
''';

const roomQuery = r'''
query Room($id: ID!) {
  room(id: $id) {
    id
    roomNumber
    type
    pricePerNight
    capacity
    amenities
    hotel { id name address }
    bookings {
      id
      guestName
      guestEmail
      checkInDate
      checkOutDate
      status
      totalPrice
    }
  }
}
''';

const roomAvailabilityQuery = r'''
query RoomAvailability($roomId: Int!, $startDate: Date!, $endDate: Date!) {
  roomAvailability(roomId: $roomId, startDate: $startDate, endDate: $endDate) {
    available
    conflicts {
      id
      checkInDate
      checkOutDate
      status
    }
  }
}
''';

const createBookingMutation = r'''
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
    totalPrice
    checkInDate
    checkOutDate
  }
}
''';

const cancelBookingMutation = r'''
mutation CancelBooking($id: ID!) {
  cancelBooking(id: $id) {
    id
    status
  }
}
''';

// Used for the Windows "widget" view: compute status "today" from confirmed bookings.
const hotelsWithBookingsQuery = r'''
query HotelsWithBookings {
  hotels {
    id
    name
    address
    description
    rooms {
      id
      roomNumber
      type
      bookings(status: confirmed) {
        id
        checkInDate
        checkOutDate
        status
      }
    }
  }
}
''';

