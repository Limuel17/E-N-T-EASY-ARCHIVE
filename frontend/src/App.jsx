import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router";

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
          ROUTER
      ============================================================ */}

      <Router>
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
            element={<h1>Unauthorized</h1>}
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

            {/* ------------------------------------------------------
                DASHBOARD
            ------------------------------------------------------ */}

            <Route
              path="dashboard"
              element={
                <h1>Summary of Dashboard</h1>
              }
            />

            {/* ------------------------------------------------------
                USER MANAGEMENT
            ------------------------------------------------------ */}

            <Route
              path="management"
              element={<UserManagement />}
            />

            {/* ------------------------------------------------------
                CUSTOMERS
            ------------------------------------------------------ */}

            <Route
              path="customers"
              element={<Customers />}
            />

            <Route
              path="customers/:id"
              element={<CustomerDetails />}
            />

            {/* ------------------------------------------------------
                PRODUCT LIST
            ------------------------------------------------------ */}

            <Route
              path="products"
              element={<ProductList />}
            />

            {/* ------------------------------------------------------
                DEVELOPMENT
            ------------------------------------------------------ */}

            <Route
              path="development"
              element={
                <h1>Development</h1>
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

            {/* ------------------------------------------------------
                INVENTORY
            ------------------------------------------------------ */}

            <Route
              path="inventory"
              element={<Inventory />}
            />

            <Route
              path="inventory/milled-run-sheets"
              element={<MilledRunSheets />}
            />

            {/* ------------------------------------------------------
                TICKET
            ------------------------------------------------------ */}

            <Route
              path="ticket"
              element={<Ticket />}
            />

            {/* ------------------------------------------------------
                CHANGE PASSWORD
            ------------------------------------------------------ */}

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

            {/* ------------------------------------------------------
                DEFAULT EMPLOYEE PAGE
            ------------------------------------------------------ */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            {/* ------------------------------------------------------
                DASHBOARD
            ------------------------------------------------------ */}

            <Route
              path="dashboard"
              element={
                <h1 className="text-2xl font-bold">
                  Employee Dashboard
                </h1>
              }
            />

            {/* ------------------------------------------------------
                CUSTOMERS
            ------------------------------------------------------ */}

            <Route
              path="customers"
              element={<Customers />}
            />

            <Route
              path="customers/:id"
              element={<CustomerDetails />}
            />

            {/* ------------------------------------------------------
                DEVELOPMENT
            ------------------------------------------------------ */}

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
                <MachineOperationLog
                  readOnly
                />
              }
            />

            {/* ------------------------------------------------------
                INVENTORY
            ------------------------------------------------------ */}

            <Route
              path="inventory"
              element={
                <Inventory
                  readOnly
                />
              }
            />

            <Route
              path="inventory/milled-run-sheets"
              element={
                <MilledRunSheets
                  readOnly
                />
              }
            />

            {/* ------------------------------------------------------
                TICKET
            ------------------------------------------------------ */}

            <Route
              path="ticket"
              element={<Ticket />}
            />

            {/* ------------------------------------------------------
                CHANGE PASSWORD
            ------------------------------------------------------ */}

            <Route
              path="change-password"
              element={<ChangePassword />}
            />

          </Route>

        </Routes>
      </Router>
    </>
  );
};

export default App;