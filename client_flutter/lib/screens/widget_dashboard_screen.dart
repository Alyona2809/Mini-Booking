import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import '../api/queries.dart';
import '../models/models.dart';
import '../utils/date_only.dart';
import 'room_screen.dart';

class WidgetDashboardScreen extends StatelessWidget {
  const WidgetDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final day = DateTime.utc(today.year, today.month, today.day);

    return Query(
      options: QueryOptions(
        document: gql(hotelsWithBookingsQuery),
        fetchPolicy: FetchPolicy.cacheAndNetwork,
      ),
      builder: (result, {fetchMore, refetch}) {
        if (result.isLoading && result.data == null) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (result.hasException) {
          return Scaffold(
            appBar: AppBar(title: const Text('Виджет')),
            body: Center(child: Text(result.exception.toString())),
          );
        }

        final hotelsJson = (result.data?['hotels'] as List<dynamic>? ?? const []);
        final hotels = hotelsJson.map((e) => Hotel.fromJson(e as Map<String, dynamic>)).toList();

        return Scaffold(
          appBar: AppBar(
            title: const Text('Виджет (Windows, облегчённый)'),
            actions: [
              IconButton(
                tooltip: 'Обновить',
                onPressed: () => refetch?.call(),
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
          body: ListView.separated(
            itemCount: hotels.length,
            separatorBuilder: (_, __) => const Divider(height: 0),
            itemBuilder: (context, i) {
              final h = hotels[i];

              int occupied = 0;
              for (final room in h.rooms) {
                final isBusy = room.bookings.any((b) {
                  final start = parseDateOnly(b.checkInDate);
                  final end = parseDateOnly(b.checkOutDate);
                  return isInRange(day, start, end);
                });
                if (isBusy) occupied++;
              }
              final free = h.rooms.length - occupied;

              return ExpansionTile(
                title: Text(h.name),
                subtitle: Text('Сегодня: свободно $free / занято $occupied'),
                children: [
                  for (final r in h.rooms)
                    ListTile(
                      title: Text('Номер #${r.roomNumber} · ${r.type}'),
                      subtitle: Text(_todayStatus(day, r)),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.of(context).push(MaterialPageRoute(builder: (_) => RoomScreen(roomId: r.id)));
                      },
                    ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  String _todayStatus(DateTime day, Room room) {
    final busy = room.bookings.any((b) {
      final start = parseDateOnly(b.checkInDate);
      final end = parseDateOnly(b.checkOutDate);
      return isInRange(day, start, end);
    });
    return busy ? 'Занято сегодня' : 'Свободно сегодня';
  }
}

