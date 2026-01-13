import { createBrowserRouter } from "react-router-dom";
import Layout from "./app/ui/Layout";
import WarehousePage from "./pages/warehouse/ui/WarehousePage";
import DevicemodelPage from "./pages/device-model/ui/DevicemodelPage";
import GlbUploaderPage from "./pages/glb-uploader";

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600">Page Not Found</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center max-w-4xl px-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-6">
          BluePepper
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          3D Warehouse IoT Device Management System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <a 
            href="/warehouse" 
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Warehouse Viewer</h3>
            <p className="text-gray-600">3D 창고 시각화 및 IoT 디바이스 배치</p>
          </a>
          
          <a 
            href="/device-model" 
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Device Model</h3>
            <p className="text-gray-600">IoT 디바이스 3D 모델 뷰어</p>
          </a>
          
          <a 
            href="/glb-uploader" 
            className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">GLB Uploader</h3>
            <p className="text-gray-600">커스텀 3D 모델 업로드 및 디바이스 배치</p>
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
          title: "Warehouse Viewer"
        }
      },
      {
        path: 'device-model',
        element: <DevicemodelPage />,
        handle: {
          title: "Device Model"
        }
      },
      {
        path: 'glb-uploader',
        element: <GlbUploaderPage />,
        handle: {
          title: "GLB Uploader"
        }
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
