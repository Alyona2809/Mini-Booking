import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import '../api/queries.dart';
import '../models/models.dart';
import 'rooms_screen.dart';
import 'widget_dashboard_screen.dart';

class HotelsScreen extends StatelessWidget {
  const HotelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Query(
      options: QueryOptions(document: gql(hotelsQuery), fetchPolicy: FetchPolicy.cacheAndNetwork),
      builder: (result, {fetchMore, refetch}) {
        if (result.isLoading && result.data == null) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (result.hasException) {
          return Scaffold(
            appBar: AppBar(title: const Text('Отели')),
            body: Center(child: Text(result.exception.toString())),
          );
        }

        final hotelsJson = (result.data?['hotels'] as List<dynamic>? ?? const []);
        final hotels = hotelsJson.map((e) => Hotel.fromJson(e as Map<String, dynamic>)).toList();

        return Scaffold(
          appBar: AppBar(
            title: const Text('Отели'),
            actions: [
              IconButton(
                tooltip: 'Обновить',
                onPressed: () => refetch?.call(),
                icon: const Icon(Icons.refresh),
              ),
              IconButton(
                tooltip: 'Окно-виджет (Windows)',
                onPressed: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WidgetDashboardScreen()));
                },
                icon: const Icon(Icons.dashboard),
              ),
            ],
          ),
          body: ListView.separated(
            itemCount: hotels.length,
            separatorBuilder: (_, __) => const Divider(height: 0),
            itemBuilder: (context, i) {
              final h = hotels[i];
              return ListTile(
                title: Text(h.name),
                subtitle: Text('${h.address}\nНомера: ${h.rooms.length}'),
                isThreeLine: true,
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => RoomsScreen(hotel: h)),
                  );
                },
              );
            },
          ),
        );
      },
    );
  }
}

