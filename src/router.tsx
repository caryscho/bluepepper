import { createBrowserRouter } from "react-router-dom";
import Layout from "./app/ui/Layout";
import WarehousePage from "./pages/warehouse/ui/WarehousePage";
import DevicemodelPage from "./pages/device-model/ui/DevicemodelPage";
import GlbUploaderPage from "./pages/glb-uploader";

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
                    Blueprint rendering
                </h1>
                <p className="mb-12 text-2xl text-gray-600">
                    3D Warehouse IoT Device Management System
                </p>

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
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);
