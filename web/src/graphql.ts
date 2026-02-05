import { gql } from "@apollo/client/core";

export const HOTELS_QUERY = gql`
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
`;

export const ROOM_QUERY = gql`
  query Room($id: ID!) {
    room(id: $id) {
      id
      roomNumber
      type
      pricePerNight
      capacity
      amenities
      hotel {
        id
        name
        address
      }
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
`;

export const ROOM_AVAILABILITY_QUERY = gql`
  query RoomAvailability($roomId: Int!, $startDate: Date!, $endDate: Date!) {
    roomAvailability(
      roomId: $roomId
      startDate: $startDate
      endDate: $endDate
    ) {
      available
      conflicts {
        id
        checkInDate
        checkOutDate
        status
      }
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      totalPrice
      checkInDate
      checkOutDate
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      id
      status
    }
  }
`;
