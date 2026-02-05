import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { HOTELS_QUERY } from "../graphql";

type HotelsData = {
  hotels: Array<{
    id: string;
    name: string;
    address: string;
    description?: string | null;
    rooms: Array<{
      id: string;
      roomNumber: string;
      type: string;
      pricePerNight: string;
      capacity: number;
    }>;
  }>;
};

export function HotelsPage() {
  const { data, loading, error, refetch } = useQuery<HotelsData>(HOTELS_QUERY);

  if (loading) return <div className="card">Загрузка отелей…</div>;
  if (error) return <div className="card error">Ошибка: {error.message}</div>;

  return (
    <div className="stack">
      <div className="row">
        <h2 className="title">Отели</h2>
        <button onClick={() => refetch()}>Обновить</button>
      </div>

      <div className="grid">
        {data?.hotels.map((h: HotelsData["hotels"][number]) => (
          <div key={h.id} className="card">
            <div className="cardTitle">{h.name}</div>
            <div className="muted">{h.address}</div>
            {h.description ? <div className="desc">{h.description}</div> : null}

            <div className="sectionTitle">Номера</div>
            <div className="list">
              {h.rooms.map(
                (r: HotelsData["hotels"][number]["rooms"][number]) => (
                  <Link key={r.id} to={`/rooms/${r.id}`} className="listItem">
                    <div>
                      <div className="mono">
                        #{r.roomNumber} · {r.type}
                      </div>
                      <div className="muted">
                        вместимость {r.capacity} · {r.pricePerNight} / ночь
                      </div>
                    </div>
                    <div className="chev">→</div>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
