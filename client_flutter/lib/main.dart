import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import 'api/graphql_client.dart';
import 'screens/hotels_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initHiveForFlutter();

  runApp(const MiniBookingApp());
}

class MiniBookingApp extends StatefulWidget {
  const MiniBookingApp({super.key});

  @override
  State<MiniBookingApp> createState() => _MiniBookingAppState();
}

class _MiniBookingAppState extends State<MiniBookingApp> {
  late final ValueNotifier<GraphQLClient> _client;

  @override
  void initState() {
    super.initState();
    _client = createClient();
  }

  @override
  void dispose() {
    _client.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLProvider(
      client: _client,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Мини-бронирование',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightBlue),
          useMaterial3: true,
        ),
        home: const HotelsScreen(),
      ),
    );
  }
}

