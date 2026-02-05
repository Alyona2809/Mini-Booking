import { Link, Route, Routes } from "react-router-dom";
import { HotelsPage } from "./pages/HotelsPage";
import { RoomPage } from "./pages/RoomPage";

export function App() {
  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="brand">
          Мини-бронирование
        </Link>
        <div className="muted">GraphQL</div>
      </header>

      <Routes>
        <Route path="/" element={<HotelsPage />} />
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}
