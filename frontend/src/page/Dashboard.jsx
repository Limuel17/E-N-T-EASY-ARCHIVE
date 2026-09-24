import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "../components/Header";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-64">
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <div className="px-3 pb-8 pt-20 sm:px-5 sm:pt-22 lg:px-7 lg:pt-24 xl:px-8">
          <div className="mx-auto w-full max-w-[1800px]">
            {/* CONTENT SURFACE */}
            <div className="min-h-[calc(100vh-8rem)]">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;