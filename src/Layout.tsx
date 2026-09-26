import Navbar from "./Navbar";
import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen w-full flex flex-col items-stretch relative"> 
            <Navbar />
            <Outlet />
        </div>
    );
}