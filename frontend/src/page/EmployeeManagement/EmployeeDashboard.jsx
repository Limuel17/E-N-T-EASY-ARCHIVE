import { Outlet } from "react-router";

import EmployeeSidebar from "./EmployeeSidebar";
import Header from "../../components/Header";

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeSidebar />

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        <Header />

        <div className="px-4 pb-8 pt-22 sm:px-6 lg:px-8 lg:pt-24">
          <div className="mx-auto w-full max-w-[1800px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;