import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import WarehouseViewer from "./components/WarehouseViewer/index";

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
        element: <WarehouseViewer />,
      },
      {
        path: 'yay',
        element: <HomePage/>
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
