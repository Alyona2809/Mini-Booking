import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CANCEL_BOOKING_MUTATION,
  CREATE_BOOKING_MUTATION,
  ROOM_AVAILABILITY_QUERY,
  ROOM_QUERY,
} from "../graphql";

type RoomData = {
  room: {
    id: string;
    roomNumber: string;
    type: string;
    pricePerNight: string;
    capacity: number;
    amenities?: string | null;
    hotel: { id: string; name: string; address: string };
    bookings: Array<{
      id: string;
      guestName: string;
      guestEmail: string;
      checkInDate: string;
      checkOutDate: string;
      status: "confirmed" | "cancelled";
      totalPrice: string;
    }>;
  } | null;
};

type AvailabilityData = {
  roomAvailability: {
    available: boolean;
    conflicts: Array<{
      id: string;
      checkInDate: string;
      checkOutDate: string;
      status: "confirmed" | "cancelled";
    }>;
  };
};

function statusLabel(status: "confirmed" | "cancelled") {
  return status === "confirmed" ? "подтверждена" : "отменена";
}

function todayDateOnly() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateOnly: string, days: number) {
  const d = new Date(`${dateOnly}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function RoomPage() {
  const { roomId } = useParams();
  const id = roomId ?? "";

  const { data, loading, error, refetch } = useQuery<RoomData>(ROOM_QUERY, {
    variables: { id },
    skip: !id,
  });

  const roomIntId = useMemo(() => Number.parseInt(id, 10), [id]);

  const [startDate, setStartDate] = useState(() => todayDateOnly());
  const [endDate, setEndDate] = useState(() => addDays(todayDateOnly(), 2));
  const [guestName, setGuestName] = useState("Тестовый пользователь");
  const [guestEmail, setGuestEmail] = useState("test@example.com");

  const [checkAvailability, availability] = useLazyQuery<AvailabilityData>(
    ROOM_AVAILABILITY_QUERY
  );
  const [createBooking, createState] = useMutation(CREATE_BOOKING_MUTATION);
  const [cancelBooking, cancelState] = useMutation(CANCEL_BOOKING_MUTATION);

  const room = data?.room ?? null;

  async function onCheck() {
    if (!Number.isFinite(roomIntId)) return;
    await checkAvailability({
      variables: { roomId: roomIntId, startDate, endDate },
    });
  }

  async function onBook() {
    if (!Number.isFinite(roomIntId)) return;
    await createBooking({
      variables: {
        input: {
          roomId: roomIntId,
          guestName,
          guestEmail,
          checkInDate: startDate,
          checkOutDate: endDate,
        },
      },
    });
    await refetch();
    await onCheck();
  }

  async function onCancel(bookingId: string) {
    await cancelBooking({ variables: { id: bookingId } });
    await refetch();
    await onCheck();
  }

  if (loading) return <div className="card">Загрузка номера…</div>;
  if (error) return <div className="card error">Ошибка: {error.message}</div>;
  if (!room) return <div className="card error">Номер не найден.</div>;

  return (
    <div className="stack">
      <div className="row">
        <div>
          <div className="breadcrumbs">
            <Link to="/">Отели</Link> <span className="muted">/</span> Номер #
            {room.roomNumber}
          </div>
          <h2 className="title">
            Номер #{room.roomNumber} · {room.type}
          </h2>
          <div className="muted">
            {room.hotel.name} · {room.hotel.address}
          </div>
        </div>
        <button onClick={() => refetch()}>Обновить</button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="sectionTitle">Доступность / Бронирование</div>

          <div className="form">
            <label>
              <div className="label">Заезд</div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              <div className="label">Выезд</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <label>
              <div className="label">Имя гостя</div>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </label>
            <label>
              <div className="label">Email гостя</div>
              <input
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </label>
          </div>

          <div className="row">
            <button onClick={onCheck} disabled={availability.loading}>
              {availability.loading ? "Проверяем…" : "Проверить доступность"}
            </button>
            <button
              className="primary"
              onClick={onBook}
              disabled={createState.loading}
            >
              {createState.loading ? "Бронируем…" : "Забронировать"}
            </button>
          </div>

          {availability.error ? (
            <div className="errorBox">
              Ошибка проверки: {availability.error.message}
            </div>
          ) : null}
          {createState.error ? (
            <div className="errorBox">
              Ошибка бронирования: {createState.error.message}
            </div>
          ) : null}

          {availability.data ? (
            <div className="result">
              <div
                className={
                  availability.data.roomAvailability.available ? "ok" : "bad"
                }
              >
                {availability.data.roomAvailability.available
                  ? "Свободно"
                  : "Занято"}
              </div>
              {availability.data.roomAvailability.conflicts.length ? (
                <div className="muted">
                  Конфликты:{" "}
                  {availability.data.roomAvailability.conflicts
                    .map(
                      (
                        c: AvailabilityData["roomAvailability"]["conflicts"][number]
                      ) => `#${c.id} ${c.checkInDate}..${c.checkOutDate}`
                    )
                    .join(", ")}
                </div>
              ) : (
                <div className="muted">Конфликтов нет</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="sectionTitle">Брони</div>
          <div className="list">
            {room.bookings.length === 0 ? (
              <div className="muted">Пока броней нет.</div>
            ) : null}
            {room.bookings.map(
              (b: NonNullable<RoomData["room"]>["bookings"][number]) => (
                <div key={b.id} className="bookingRow">
                  <div>
                    <div className="mono">
                      #{b.id} · {b.checkInDate} → {b.checkOutDate}
                    </div>
                    <div className="muted">
                      {b.guestName} ({b.guestEmail}) · {b.totalPrice} ·{" "}
                      <span
                        className={
                          b.status === "confirmed" ? "tag okTag" : "tag"
                        }
                      >
                        {statusLabel(b.status)}
                      </span>
                    </div>
                  </div>
                  {b.status === "confirmed" ? (
                    <button
                      onClick={() => onCancel(b.id)}
                      disabled={cancelState.loading}
                      className="danger"
                      title="Отменить бронь"
                    >
                      Отменить
                    </button>
                  ) : null}
                </div>
              )
            )}
          </div>

          {cancelState.error ? (
            <div className="errorBox">
              Ошибка отмены: {cancelState.error.message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
