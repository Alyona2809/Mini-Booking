import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:intl/intl.dart';

import '../api/queries.dart';
import '../models/models.dart';
import '../widgets/error_view.dart';

class RoomScreen extends StatefulWidget {
  const RoomScreen({super.key, required this.roomId});

  final String roomId;

  @override
  State<RoomScreen> createState() => _RoomScreenState();
}

class _RoomScreenState extends State<RoomScreen> {
  DateTimeRange? _range;
  final TextEditingController _guestNameCtrl = TextEditingController(text: 'Тестовый пользователь');
  final TextEditingController _guestEmailCtrl = TextEditingController(text: 'test@example.com');

  String? _lastAvailabilityText;
  String? _lastAvailabilityDetails;

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _range = DateTimeRange(start: DateTime(today.year, today.month, today.day), end: DateTime(today.year, today.month, today.day).add(const Duration(days: 2)));
  }

  @override
  void dispose() {
    _guestNameCtrl.dispose();
    _guestEmailCtrl.dispose();
    super.dispose();
  }

  String _fmtDate(DateTime d) => DateFormat('yyyy-MM-dd').format(d);

  String get _startDate => toDateOnly(_range!.start);
  String get _endDate => toDateOnly(_range!.end);

  @override
  Widget build(BuildContext context) {
    return Query(
      options: QueryOptions(document: gql(roomQuery), variables: {'id': widget.roomId}, fetchPolicy: FetchPolicy.cacheAndNetwork),
      builder: (result, {fetchMore, refetch}) {
        if (result.isLoading && result.data == null) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (result.hasException) {
          return Scaffold(
            appBar: AppBar(title: const Text('Номер')),
            body: ErrorView(result.exception.toString(), onRetry: () => refetch?.call()),
          );
        }

        final roomJson = result.data?['room'] as Map<String, dynamic>?;
        if (roomJson == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Номер')),
            body: const Center(child: Text('Номер не найден')),
          );
        }

        final room = Room.fromJson(roomJson);

        return Scaffold(
          appBar: AppBar(
            title: Text('Номер #${room.roomNumber}'),
            actions: [
              IconButton(
                tooltip: 'Обновить',
                onPressed: () async {
                  await refetch?.call();
                },
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
          body: Padding(
            padding: const EdgeInsets.all(12),
            child: ListView(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${room.hotel?.name ?? ''}', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 6),
                        Text('Тип: ${room.type} · Вместимость: ${room.capacity} · ${room.pricePerNight} / ночь'),
                        if ((room.amenities ?? '').isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text('Удобства: ${room.amenities}'),
                        ],
                      ],
                    ),
                  ),
                ),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Выбери диапазон дат', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final picked = await showDateRangePicker(
                                    context: context,
                                    firstDate: DateTime.now().subtract(const Duration(days: 1)),
                                    lastDate: DateTime.now().add(const Duration(days: 365)),
                                    initialDateRange: _range,
                                  );
                                  if (picked != null) setState(() => _range = picked);
                                },
                                icon: const Icon(Icons.date_range),
                                label: Text('${_fmtDate(_range!.start)} → ${_fmtDate(_range!.end)}'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          decoration: const InputDecoration(labelText: 'Имя гостя'),
                          controller: _guestNameCtrl,
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          decoration: const InputDecoration(labelText: 'Email гостя'),
                          controller: _guestEmailCtrl,
                        ),
                        const SizedBox(height: 12),

                        Row(
                          children: [
                            Expanded(
                              child: Mutation(
                                options: MutationOptions(document: gql(roomAvailabilityQuery)),
                                builder: (runMutation, mutationResult) {
                                  return OutlinedButton(
                                    onPressed: mutationResult?.isLoading == true
                                        ? null
                                        : () async {
                                            final vars = {'roomId': room.idInt, 'startDate': _startDate, 'endDate': _endDate};
                                            final res = await runMutation(vars).networkResult;
                                            final payload = res?.data?['roomAvailability'] as Map<String, dynamic>?;
                                            if (payload == null) return;
                                            final available = payload['available'] == true;
                                            final conflicts = (payload['conflicts'] as List<dynamic>? ?? const []);
                                            setState(() {
                                              _lastAvailabilityText = available ? 'Свободно' : 'Занято';
                                              _lastAvailabilityDetails = conflicts.isEmpty
                                                  ? 'Конфликтов нет'
                                                  : conflicts
                                                      .map((c) {
                                                        final m = c as Map<String, dynamic>;
                                                        return '#${m['id']} ${m['checkInDate']}..${m['checkOutDate']}';
                                                      })
                                                      .join(', ');
                                            });
                                          },
                                    child: Text(mutationResult?.isLoading == true ? 'Проверяем…' : 'Проверить доступность'),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Mutation(
                                options: MutationOptions(document: gql(createBookingMutation)),
                                builder: (runMutation, mutationResult) {
                                  return FilledButton(
                                    onPressed: mutationResult?.isLoading == true
                                        ? null
                                        : () async {
                                            final input = {
                                              'roomId': room.idInt,
                                              'guestName': _guestNameCtrl.text,
                                              'guestEmail': _guestEmailCtrl.text,
                                              'checkInDate': _startDate,
                                              'checkOutDate': _endDate,
                                            };
                                            final res = await runMutation({'input': input}).networkResult;
                                            if (res?.hasException == true) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(content: Text(res!.exception.toString())),
                                              );
                                              return;
                                            }
                                            await refetch?.call();
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Бронь создана')),
                                            );
                                          },
                                    child: Text(mutationResult?.isLoading == true ? 'Бронируем…' : 'Забронировать'),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),

                        if (_lastAvailabilityText != null) ...[
                          const SizedBox(height: 12),
                          Text('Результат: $_lastAvailabilityText', style: Theme.of(context).textTheme.titleMedium),
                          if (_lastAvailabilityDetails != null) Text(_lastAvailabilityDetails!),
                        ],
                      ],
                    ),
                  ),
                ),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Брони', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        if (room.bookings.isEmpty) const Text('Броней нет'),
                        ...room.bookings.map((b) {
                          final statusColor = b.status == 'confirmed' ? Colors.green : Colors.grey;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text('#${b.id} · ${b.checkInDate} → ${b.checkOutDate}'),
                            subtitle: Text('${b.guestName} (${b.guestEmail}) · ${b.totalPrice}'),
                            trailing: Wrap(
                              spacing: 8,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Chip(
                                  label: Text(b.status == 'confirmed' ? 'подтверждена' : 'отменена'),
                                  backgroundColor: statusColor.withOpacity(0.15),
                                ),
                                if (b.status == 'confirmed')
                                  Mutation(
                                    options: MutationOptions(document: gql(cancelBookingMutation)),
                                    builder: (runMutation, mutationResult) {
                                      return IconButton(
                                        tooltip: 'Отменить',
                                        onPressed: mutationResult?.isLoading == true
                                            ? null
                                            : () async {
                                                final res = await runMutation({'id': b.id}).networkResult;
                                                if (res?.hasException == true) {
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    SnackBar(content: Text(res!.exception.toString())),
                                                  );
                                                  return;
                                                }
                                                await refetch?.call();
                                              },
                                        icon: const Icon(Icons.cancel),
                                      );
                                    },
                                  ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

