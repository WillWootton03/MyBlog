import { createBrowserRouter  } from "react-router";
import Landing from "./pages/Landing";
import Layout from "./Layout";
import AdminLogin from "./pages/AdminLogin";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            { index: true, Component: Landing },
            { path: '/admin/login', Component: AdminLogin },
        ]
    }
])