import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Root from "./components/Root";
import Login from "./page/Login";
import ProtectedRoutes from "./utils/ProtectedRoutes";

import Dashboard from "./page/Dashboard";
import UserManagement from "./page/UserManagement";

import Customers from "./page/Customers/Customers";
import CustomerDetails from "./page/Customers/CustomerDetails.jsx";
import ProductList from "./page/ProductList/ProductList.jsx";

import FactoryCard from "./page/FactoryCard/FactoryCard";
import FactoryCardHistory from "./page/FactoryCard/FactoryCardHistory";

import MachineOperationLog from "./page/MachineOperationLog/MachineOperationLog";

import Ticket from "./page/Ticket/Ticket";

import Inventory from "./page/Inventory/Inventory";
import MilledRunSheets from "./page/Inventory/MilledRunSheets/MilledRunSheets";

import ChangePassword from "./page/EmployeeManagement/ChangePassword";
import EmployeeDashboard from "./page/EmployeeManagement/EmployeeDashboard";

import JobOrder from "./page/JobOrder/JobOrder.jsx";

import Alert from "./components/Alert.jsx";
import useAlert from "./context/useAlert.jsx";

const App = () => {
  const { alert, closeAlert } = useAlert();

  return (
    <>
      {/* ============================================================
          GLOBAL ALERT
      ============================================================ */}
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={closeAlert}
      />

      {/* ============================================================
          APPLICATION ROUTES
      ============================================================ */}
      <Routes>
        {/* ========================================================
            PUBLIC ROUTES
        ======================================================== */}

        <Route
          path="/"
          element={<Root />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/unauthorize"
          element={
            <h1 className="p-6 text-2xl font-bold">
              Unauthorized
            </h1>
          }
        />

        {/* ========================================================
            ADMIN ROUTES
        ======================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoutes requireRole={["admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          {/* Dashboard */}
          <Route
            path="dashboard"
            element={
              <h1 className="text-2xl font-bold">
                Summary of Dashboard
              </h1>
            }
          />

          {/* User Management */}
          <Route
            path="management"
            element={<UserManagement />}
          />

          <Route
  path="job-orders"
  element={<JobOrder />}
/>

          {/* Customers */}
          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="customers/:id"
            element={<CustomerDetails />}
          />

          {/* Products */}
          <Route
            path="products"
            element={<ProductList />}
          />

          {/* Development */}
          <Route
            path="development"
            element={
              <h1 className="text-2xl font-bold">
                Development
              </h1>
            }
          />

          {/* Factory Card */}
          <Route
            path="development/factorycard"
            element={<FactoryCard />}
          />

          <Route
            path="development/factorycard/:id"
            element={<FactoryCard />}
          />

          <Route
            path="development/factorycard/:id/history"
            element={<FactoryCardHistory />}
          />

          {/* Machine Operation Log */}
          <Route
            path="development/machine-operation-log"
            element={<MachineOperationLog />}
          />

          {/* Inventory */}
          <Route
            path="inventory"
            element={<Inventory />}
          />

          <Route
            path="inventory/milled-run-sheets"
            element={<MilledRunSheets />}
          />

          {/* Ticket */}
          <Route
            path="ticket"
            element={<Ticket />}
          />

          {/* Change Password */}
          <Route
            path="change-password"
            element={<ChangePassword />}
          />
        </Route>

        {/* ========================================================
            EMPLOYEE ROUTES
        ======================================================== */}

        <Route
          path="/employee"
          element={
            <ProtectedRoutes requireRole={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoutes>
          }
        >
          {/* Default Employee Page */}
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={
              <h1 className="text-2xl font-bold">
                Employee Dashboard
              </h1>
            }
          />

          {/* Customers */}
          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="customers/:id"
            element={<CustomerDetails />}
          />

          {/* Development */}
          <Route
            path="development"
            element={
              <h1 className="text-2xl font-bold">
                Development
              </h1>
            }
          />

          {/* Factory Card */}
          <Route
            path="development/factorycard"
            element={<FactoryCard />}
          />

          <Route
            path="development/factorycard/:id"
            element={<FactoryCard />}
          />

          <Route
            path="development/factorycard/:id/history"
            element={<FactoryCardHistory />}
          />

          {/* Machine Operation Log */}
          <Route
            path="development/machine-operation-log"
            element={
              <MachineOperationLog readOnly />
            }
          />

          {/* Inventory */}
          <Route
            path="inventory"
            element={
              <Inventory readOnly />
            }
          />

          <Route
            path="inventory/milled-run-sheets"
            element={
              <MilledRunSheets readOnly />
            }
          />

          {/* Ticket */}
          <Route
            path="ticket"
            element={<Ticket />}
          />

          {/* Change Password */}
          <Route
            path="change-password"
            element={<ChangePassword />}
          />
        </Route>

        {/* ========================================================
            FALLBACK
        ======================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;