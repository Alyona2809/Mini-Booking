const { GraphQLScalarType, Kind, GraphQLError } = require("graphql");

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value) {
  if (typeof value !== "string" || !DATE_ONLY_RE.test(value)) return false;
  // Проверяем, что дата реально существует (например, 2026-02-30 — не ок)
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === value;
}

const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Дата в формате YYYY-MM-DD",
  serialize(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (isValidDateOnly(value)) return value;
    throw new TypeError(
      `Невозможно преобразовать значение в дату: ${String(value)}`
    );
  },
  parseValue(value) {
    if (isValidDateOnly(value)) return value;
    throw new GraphQLError("Неверная дата. Ожидается YYYY-MM-DD.");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING && isValidDateOnly(ast.value))
      return ast.value;
    throw new GraphQLError("Неверная дата. Ожидается YYYY-MM-DD.");
  },
});

module.exports = { DateScalar, isValidDateOnly };
