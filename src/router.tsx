import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Scene3D from "./components/Scene3D";

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
        element: <Scene3D />,
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
