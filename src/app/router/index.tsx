import { createBrowserRouter } from "react-router-dom";
import Layout from "../ui/Layout";
import HomePage from "../../pages/home";
import WarehousePage from "../../pages/warehouse";
import DevicemodelPage from "../../pages/device-model/ui/DevicemodelPage";
import GlbUploaderPage from "../../pages/glb-uploader";
import ChartShowcasePage from "../../pages/chart-showcase/index";
import FloorPlannerPage from "../../pages/floor-planner";
import MapboxTestPage from "../../pages/mapbox-test";
import DashboardPage from "@/pages/dashboard";

function NotFoundPage() {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="text-center">
                <h1 className="mb-4 text-6xl font-bold text-gray-300">404</h1>
                <p className="text-xl text-gray-600">Page Not Found</p>
            </div>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "playground",
                element: <HomePage />,
                handle: {
                    title: "Playground",
                },
            },
            {
                path: "dashboard",
                element: <DashboardPage />,
                handle: {
                    title: "Dashboard",
                },
            },
            {
                path: "warehouse",
                element: <WarehousePage />,
                handle: {
                    title: "Warehouse Viewer",
                },
            },
            {
                path: "device-model",
                element: <DevicemodelPage />,
                handle: {
                    title: "Device Model",
                },
            },
            {
                path: "glb-uploader",
                element: <GlbUploaderPage />,
                handle: {
                    title: "GLB Uploader",
                },
            },
            {
                path: "chart-showcase",
                element: <ChartShowcasePage />,
                handle: {
                    title: "Chart Showcase",
                },
            },
            {
                path: "floor-planner",
                element: <FloorPlannerPage />,
                handle: {
                    title: "Floor Planner",
                },
            },
            {
                path: "mapbox-test",
                element: <MapboxTestPage />,
                handle: {
                    title: "Mapbox Test",
                },
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);
