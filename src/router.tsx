import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./app/ui/Layout";
import WarehousePage from "./pages/warehouse/ui/WarehousePage";
import DiviceModel from "./entity/device/ui/DiviceModel";

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
      },
      {
        path: 'divice-model',
        element: <DiviceModel/>
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
