import 'package:graphql_flutter/graphql_flutter.dart';

String defaultGraphqlUrl() {
  // Для Windows/macOS/Linux: localhost обычно ок.
  // Для Android emulator: используй http://10.0.2.2:3000/graphql
  // Для реального телефона: используй IP в локальной сети, например http://192.168.0.10:3000/graphql
  const envUrl = String.fromEnvironment('GRAPHQL_URL');
  if (envUrl.isNotEmpty) return envUrl;
  return 'http://localhost:3000/graphql';
}

ValueNotifier<GraphQLClient> createClient({String? url}) {
  final link = HttpLink(url ?? defaultGraphqlUrl());
  return ValueNotifier(
    GraphQLClient(
      link: link,
      cache: GraphQLCache(store: InMemoryStore()),
    ),
  );
}

