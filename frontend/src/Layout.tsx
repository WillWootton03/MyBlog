import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen w-full flex justify-center px-10 lg:px-0 py-4 bg-[#efe2ff] relative"> 
            <Outlet />
        </div>
    );
}