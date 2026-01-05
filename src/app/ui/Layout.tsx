import { Outlet, NavLink } from "react-router-dom";
import "../../App.css";

export default function Layout() {
    return (
        <div className="app">
            <header className="flex justify-between p-4 w-full text-black bg-gray-100">
                <h1>Playground</h1>
                <nav className="flex gap-1">
                    <NavLink to="warehouse">Warehouse</NavLink>
                </nav>
            </header>
            <Outlet />
        </div>
    );
}
