import { Outlet, NavLink, useMatches, Link, useMatch } from "react-router-dom";
import "../../App.css";

export default function Layout() {
    const matches = useMatches();
    const currentTitle = matches.find(
        (match) => (match.handle as { title?: string })?.title
    )?.handle as { title?: string };

    return (
        <div className="flex h-screen">
            <header className="flex flex-col p-4 h-screen text-black bg-[#1b1e26] w-[240px] shrink-0">
                <Link to="/">
                    <h1 className="text-2xl font-bold text-white">Willog</h1>
                </Link>

                <nav className="flex flex-col gap-1 mt-10">
                    <NavLink to="warehouse">Warehouse Viewer</NavLink>
                    <NavLink to="device-model">Device Model</NavLink>
                    <NavLink to="glb-uploader">GLB Uploader</NavLink>
                </nav>
            </header>
            <div className="flex flex-col w-full h-screen">
                {currentTitle?.title && (
                    <div className="flex items-center p-2 px-5 w-full h-14 border-b shrink-0">
                        {useMatches().map((match) => (
                            <div key={match.id}>
                                {(match.handle as { title?: string })?.title}
                            </div>
                        ))}
                    </div>
                )}
                <div className="overflow-y-auto flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
