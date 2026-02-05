import 'package:flutter/material.dart';

import '../models/models.dart';
import 'room_screen.dart';

class RoomsScreen extends StatelessWidget {
  const RoomsScreen({super.key, required this.hotel});

  final Hotel hotel;

  @override
  Widget build(BuildContext context) {
    final rooms = hotel.rooms;
    return Scaffold(
      appBar: AppBar(title: Text(hotel.name)),
      body: ListView.separated(
        itemCount: rooms.length,
        separatorBuilder: (_, __) => const Divider(height: 0),
        itemBuilder: (context, i) {
          final r = rooms[i];
          return ListTile(
            title: Text('Номер #${r.roomNumber} · ${r.type}'),
            subtitle: Text('Вместимость: ${r.capacity} · ${r.pricePerNight} / ночь'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => RoomScreen(roomId: r.id)),
              );
            },
          );
        },
      ),
    );
  }
}

