import { createBrowserRouter  } from "react-router";
import Landing from "./pages/Landing";
import Layout from "./Layout";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            { index: true, Component: Landing },
        ]
    }
])