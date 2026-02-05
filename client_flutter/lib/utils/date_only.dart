DateTime parseDateOnly(String dateOnly) {
  // dateOnly: YYYY-MM-DD
  // Парсим как полночь UTC, чтобы не было сдвигов по таймзонам.
  return DateTime.parse('${dateOnly}T00:00:00.000Z');
}

String toDateOnly(DateTime d) {
  final utc = DateTime.utc(d.year, d.month, d.day);
  final mm = utc.month.toString().padLeft(2, '0');
  final dd = utc.day.toString().padLeft(2, '0');
  return '${utc.year}-$mm-$dd';
}

bool isInRange(DateTime day, DateTime startInclusive, DateTime endExclusive) {
  return (day.isAtSameMomentAs(startInclusive) || day.isAfter(startInclusive)) && day.isBefore(endExclusive);
}

