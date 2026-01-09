import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./app/ui/Layout";
import WarehousePage from "./pages/warehouse/ui/WarehousePage";
import DevicemodelPage from "./pages/device-model/ui/DevicemodelPage";
import GlbUploaderPage from "./pages/glb-uploader";
import TestPage from "./pages/TestPage.tsx";

function NotFoundPage() {
  return <div>404 - Page Not Found</div>;
}

function HomePage(){
  return <div>home!!</div>
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage/>,
      },
      {
        path: "warehouse",
        element: <WarehousePage />,
        handle: {
          title: "Warehouse Viewer"
        }
      },
      {
        path: 'divice-model',
        element: <DevicemodelPage/>,
        handle: {
          title: "Device Model"
        }
      },
      {
        path: 'glb-uploader',
        element: <GlbUploaderPage/>,
        handle: {
          title: "GLB Uploader"
        }
      },
      {
        path: 'test',
        element: <TestPage/>,
        handle: {
          title: "Test"
        }
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
