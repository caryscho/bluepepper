import { Outlet, NavLink } from "react-router-dom";
import "../../App.css";

export default function Layout() {
    return (
        <div className="flex">
            <header className="flex flex-col p-4 w-full text-black bg-[#1b1e26] w-[240px] shrink-0">
                <h1 className="text-2xl font-bold text-white">Willog</h1>

                <nav className="flex flex-col gap-1 mt-10">
                    <NavLink to="warehouse">Warehouse Viewer</NavLink>
                </nav>
            </header>
            <div className="w-full">
                <div className="flex items-center p-2 px-5 w-full h-14 border-b">sub header area</div>
                <Outlet />
            </div>
        </div>
    );
}
