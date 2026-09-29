import { Outlet } from "react-router";
import { MainProvider } from './contexts/MainContext';

export default function Layout() {
    return (
        <MainProvider>
            <div className="min-h-screen w-full flex justify-center px-10 lg:px-0 py-4 bg-[#efe2ff] background-img"> 
                <Outlet />
            </div>
        </MainProvider>
    );
}