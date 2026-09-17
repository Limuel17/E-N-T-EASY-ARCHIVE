import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "../components/Header";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-64">
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <div className="px-4 pb-8 pt-22 sm:px-6 lg:px-8 lg:pt-24">
          <div className="mx-auto w-full max-w-[1800px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;