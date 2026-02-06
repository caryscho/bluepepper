import { Outlet, NavLink, useMatches, Link, useMatch } from "react-router-dom";
import { WarehouseIcon, SmartphoneIcon, LayoutDashboard } from "lucide-react";

export default function Layout() {
    const matches = useMatches();
    const currentTitle = matches.find(
        (match) => (match.handle as { title?: string })?.title
    )?.handle as { title?: string };

    const navItems = [
        {
            to: '/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-4 h-4"/>,
        },
        {
            to: "/warehouse",
            label: "Warehouse Viewer",
            icon: <WarehouseIcon className="w-4 h-4"/>,
        },
        {
            to: "/device-model",
            label: "Device Model",
            icon: <SmartphoneIcon className="w-4 h-4"/>,
        },
        // {
        //     to: "/glb-uploader",
        //     label: "GLB Uploader",
        // },
        // {
        //     to: "/chart-showcase",
        //     label: "Chart Showcase",
        // },
        // {
        //     to: "/floor-planner",
        //     label: "Floor Planner",
        // },
        // {
        //     to: "/mapbox-test",
        //     label: "Mapbox Test",
        // },
    ];  

    return (
        <div className="flex h-screen">
            <nav className="flex flex-col p-4 h-screen text-black w-[240px] shrink-0 shadow-sm border-r border-gray-100 z-10">
                <Link to="/" className="flex justify-center items-center py-4">
                    <h1 className="max-w-[90px] flex justify-center items-center">
                        <img src="/logo-dark.svg" alt="Willog CC" className="w-full h-full" />
                    </h1>
                </Link>

                {navItems.map((item) => (
                    <NavLink
                        to={item.to}
                        key={item.to}
                        className={({ isActive }) =>
                            `flex justify-start items-center py-4 px-3 rounded-lg hover:bg-white hover:text-blue-600 ${
                                isActive ? "bg-white text-blue-600" : "text-black"
                            }`
                        }
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="flex flex-col w-full h-screen bg-white">
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
