import { Outlet, NavLink } from "react-router-dom";
import "./../App.css";

export default function Layout() {
  return (
    <div className="app">
      <header
        className="flex justify-between"
        style={{ padding: "1rem", background: "#1a1a1a", color: "white" }}
      >
        <h1>Playground</h1>
        <nav className="flex gap-1">
          <NavLink to="warehouse">Warehouse</NavLink>
          <NavLink to="warehouse">Warehouse</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
