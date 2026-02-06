import { createBrowserRouter } from "react-router-dom";
import Layout from "../ui/Layout";
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

function HomePage() {
    return (
        <div className="flex flex-col justify-center items-center h-full bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="px-8 max-w-4xl text-center">
                <h1 className="mb-6 text-6xl font-bold text-gray-800">
                    Playground
                </h1>
                <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3">
                    <a
                        href="/warehouse"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">🏭</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            Warehouse Viewer
                        </h3>
                        <p className="text-gray-600">
                            3D 창고 시각화 및 IoT 디바이스 배치
                        </p>
                    </a>

                    <a
                        href="/device-model"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">📱</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            Device Model
                        </h3>
                        <p className="text-gray-600">
                            IoT 디바이스 3D 모델 뷰어
                        </p>
                    </a>

                    <a
                        href="/glb-uploader"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">📦</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            GLB Uploader
                        </h3>
                        <p className="text-gray-600">
                            커스텀 3D 모델 업로드 및 디바이스 배치
                        </p>
                    </a>
                    <a
                        href="/chart-showcase"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">📊</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            Chart Showcase
                        </h3>
                        <p className="text-gray-600">
                            차트 시각화 페이지
                        </p>
                    </a>
                    <a
                        href="/floor-planner"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">📐</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            Floor Planner
                        </h3>
                        <p className="text-gray-600">
                            2D 평면도 편집기 및 3D 렌더링
                        </p>
                    </a>
                    <a
                        href="/mapbox-test"
                        className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="mb-4 text-4xl">🗺️</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                            Mapbox Test
                        </h3>
                        <p className="text-gray-600">
                            Mapbox GL 지도 연동 테스트
                        </p>
                    </a>
                </div>
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
