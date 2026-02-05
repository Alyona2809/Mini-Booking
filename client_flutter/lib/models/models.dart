class Hotel {
  Hotel({
    required this.id,
    required this.name,
    required this.address,
    this.description,
    required this.rooms,
  });

  final String id;
  final String name;
  final String address;
  final String? description;
  final List<Room> rooms;

  factory Hotel.fromJson(Map<String, dynamic> json) {
    return Hotel(
      id: json['id'].toString(),
      name: json['name'] as String,
      address: json['address'] as String,
      description: json['description'] as String?,
      rooms: (json['rooms'] as List<dynamic>? ?? const [])
          .map((e) => Room.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class Room {
  Room({
    required this.id,
    required this.roomNumber,
    required this.type,
    required this.pricePerNight,
    required this.capacity,
    this.amenities,
    this.hotel,
    this.bookings = const [],
  });

  final String id;
  final String roomNumber;
  final String type;
  final String pricePerNight;
  final int capacity;
  final String? amenities;
  final HotelRef? hotel;
  final List<Booking> bookings;

  int get idInt => int.tryParse(id) ?? -1;

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'].toString(),
      roomNumber: json['roomNumber'] as String,
      type: json['type'] as String,
      pricePerNight: json['pricePerNight'].toString(),
      capacity: (json['capacity'] as num).toInt(),
      amenities: json['amenities'] as String?,
      hotel: json['hotel'] != null ? HotelRef.fromJson(json['hotel'] as Map<String, dynamic>) : null,
      bookings: (json['bookings'] as List<dynamic>? ?? const [])
          .map((e) => Booking.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class HotelRef {
  HotelRef({required this.id, required this.name, required this.address});

  final String id;
  final String name;
  final String address;

  factory HotelRef.fromJson(Map<String, dynamic> json) {
    return HotelRef(
      id: json['id'].toString(),
      name: json['name'] as String,
      address: json['address'] as String,
    );
  }
}

class Booking {
  Booking({
    required this.id,
    required this.guestName,
    required this.guestEmail,
    required this.checkInDate,
    required this.checkOutDate,
    required this.status,
    required this.totalPrice,
  });

  final String id;
  final String guestName;
  final String guestEmail;
  final String checkInDate; // YYYY-MM-DD
  final String checkOutDate; // YYYY-MM-DD
  final String status; // confirmed/cancelled
  final String totalPrice;

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'].toString(),
      guestName: (json['guestName'] ?? '') as String,
      guestEmail: (json['guestEmail'] ?? '') as String,
      checkInDate: json['checkInDate'].toString(),
      checkOutDate: json['checkOutDate'].toString(),
      status: json['status'].toString(),
      totalPrice: json['totalPrice'].toString(),
    );
  }
}

