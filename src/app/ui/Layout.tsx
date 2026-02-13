import { useState } from "react";
import { Outlet, NavLink, useMatches, Link, useMatch } from "react-router-dom";
import { WarehouseIcon, SmartphoneIcon, LayoutDashboard, ChevronLeft, ChevronRight, MapIcon, CogIcon, LogOutIcon, PlayIcon } from "lucide-react";

export default function Layout() {
    const [isMinimized, setIsMinimized] = useState(false);
    const matches = useMatches();
    const currentTitle = matches.find(
        (match) => (match.handle as { title?: string })?.title
    )?.handle as { title?: string };

    const navItems = [
        {
            to: '/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
            to: '/warehouse',
            label: 'Warehouse',
            icon: <WarehouseIcon className="w-4 h-4" />,
        },
        {
            to: "/playground",
            label: "Playground",
            icon: <PlayIcon className="w-4 h-4" />,
        },

    ];

    return (
        <div className="flex h-screen">
            <nav className={`flex flex-col relative p-4 h-screen text-black shrink-0 shadow-sm border-r border-gray-100 z-10 transition-all duration-300 ${isMinimized ? "w-[80px]" : "w-[240px]"
                }`}>
                <div className="flex justify-between items-center mb-4">
                    <Link to="/" className={`flex justify-center items-center py-4 transition-opacity ${isMinimized ? "w-full" : "w-full"
                        }`}>
                        {isMinimized ? (
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-blue-700">
                                W
                            </p>
                        ) : (
                            <h1 className="max-w-[90px] flex justify-center items-center">
                                <img src="/logo-dark.svg" alt="Willog CC" className="w-full h-full" />
                            </h1>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="absolute -right-3 top-16 z-20 p-1 bg-white rounded-full border border-gray-200 shadow-md transition-colors hover:bg-gray-50"
                        aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
                    >
                        {isMinimized ? (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>

                {navItems.map((item) => (
                    <NavLink
                        to={item.to}
                        key={item.to}
                        className={({ isActive }) =>
                            `flex justify-start items-center py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors ${isActive ? "bg-white text-blue-600" : "text-black"
                            } ${isMinimized ? "justify-center px-0" : "px-3"}`
                        }
                        title={isMinimized ? item.label : undefined}
                    >
                        <span className={isMinimized ? "":"mr-2"}>{item.icon}</span>
                        {!isMinimized && item.label}
                    </NavLink>
                ))}
                <NavLink to="/mapbox-test" className="flex justify-start items-center px-3 py-4 mt-auto rounded-lg transition-colors hover:bg-white hover:text-blue-600">
                    <span className="mr-2"><CogIcon className="w-4 h-4" /></span>
                    {!isMinimized && <span>Setting</span>}
                </NavLink>
                <NavLink to="/mapbox-test" className="flex justify-start items-center px-3 py-4 rounded-lg transition-colors hover:bg-white hover:text-blue-600">
                    <span className="mr-2"><LogOutIcon className="w-4 h-4" /></span>
                    {!isMinimized && <span>Logout</span>}
                </NavLink>
            </nav>
            <div className="flex flex-col w-full h-screen bg-white">
                {currentTitle?.title && (
                    <div className="flex items-center p-2 px-5 w-full h-14 border-b shrink-0">
                        {matches.map((match) => {
                            const title = (match.handle as { title?: string })?.title;
                            return title ? (
                                <div key={match.id}>{title}</div>
                            ) : null;
                        })}
                    </div>
                )}
                <div className="overflow-y-auto flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
