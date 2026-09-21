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

import FactoryCard from "./page/FactoryCard/FactoryCard";
import FactoryCardHistory from "./page/FactoryCard/FactoryCardHistory";

import MachineOperationLog from "./page/MachineOperationLog/MachineOperationLog";

import Ticket from "./page/Ticket/Ticket";

import Inventory from "./page/Inventory/Inventory";
import MilledRunSheets from "./page/Inventory/MilledRunSheets/MilledRunSheets";

import ChangePassword from "./page/EmployeeManagement/ChangePassword";
import EmployeeDashboard from "./page/EmployeeManagement/EmployeeDashboard";

// ============================================================
// GLOBAL ALERT
// ============================================================

import Alert from "./components/Alert.jsx";
import useAlert from "./context/useAlert.jsx";

const App = () => {
  const { alert, closeAlert } = useAlert();

  return (
    <>
      {/* ========================================================
          GLOBAL ALERT
      ======================================================== */}

      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={closeAlert}
      />

      {/* ========================================================
          ROUTER
      ======================================================== */}

      <Router>
        <Routes>
          {/* ============================================================
              PUBLIC
          ============================================================ */}

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

          {/* ============================================================
              ADMIN
          ============================================================ */}

          <Route
            path="/admin"
            element={
              <ProtectedRoutes requireRole={["admin"]}>
                <Dashboard />
              </ProtectedRoutes>
            }
          >
            {/* ========================================================
                DASHBOARD
            ======================================================== */}

            <Route
              path="dashboard"
              element={
                <h1>
                  Summary of Dashboard
                </h1>
              }
            />

            {/* ========================================================
                ADMIN MANAGEMENT
            ======================================================== */}

            <Route
              path="management"
              element={<UserManagement />}
            />

            {/* ========================================================
                DEVELOPMENT
            ======================================================== */}

            <Route
              path="development"
              element={
                <h1>
                  Development
                </h1>
              }
            />

            {/* ========================================================
                FACTORY CARD
            ======================================================== */}

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

            {/* ========================================================
                MACHINE OPERATION LOG
            ======================================================== */}

            <Route
              path="development/machine-operation-log"
              element={<MachineOperationLog />}
            />

            {/* ========================================================
                INVENTORY
            ======================================================== */}

            <Route
              path="inventory"
              element={<Inventory />}
            />

            <Route
              path="inventory/milled-run-sheets"
              element={<MilledRunSheets />}
            />

            {/* ========================================================
                TICKET
            ======================================================== */}

            <Route
              path="ticket"
              element={<Ticket />}
            />

            {/* ========================================================
                CHANGE PASSWORD
            ======================================================== */}

            <Route
              path="change-password"
              element={<ChangePassword />}
            />
          </Route>

          {/* ============================================================
              EMPLOYEE
          ============================================================ */}

          <Route
            path="/employee"
            element={
              <ProtectedRoutes requireRole={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoutes>
            }
          >
            {/* ========================================================
                DEFAULT EMPLOYEE PAGE
            ======================================================== */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            {/* ========================================================
                DASHBOARD
            ======================================================== */}

            <Route
              path="dashboard"
              element={
                <h1 className="text-2xl font-bold">
                  Employee Dashboard
                </h1>
              }
            />

            {/* ========================================================
                DEVELOPMENT
            ======================================================== */}

            <Route
              path="development"
              element={
                <h1 className="text-2xl font-bold">
                  Development
                </h1>
              }
            />

            {/* ========================================================
                FACTORY CARD - READ ONLY
            ======================================================== */}

            <Route
              path="development/factorycard"
              element={<FactoryCard readOnly />}
            />

            <Route
              path="development/factorycard/:id"
              element={<FactoryCard readOnly />}
            />

            <Route
              path="development/factorycard/:id/history"
              element={<FactoryCardHistory />}
            />

            {/* ========================================================
                MACHINE OPERATION LOG - READ ONLY
            ======================================================== */}

            <Route
              path="development/machine-operation-log"
              element={
                <MachineOperationLog readOnly />
              }
            />

            {/* ========================================================
                INVENTORY - READ ONLY
            ======================================================== */}

            <Route
              path="inventory"
              element={<Inventory readOnly />}
            />

            <Route
              path="inventory/milled-run-sheets"
              element={
                <MilledRunSheets readOnly />
              }
            />

            {/* ========================================================
                TICKET
            ======================================================== */}

            <Route
              path="ticket"
              element={<Ticket />}
            />

            {/* ========================================================
                CHANGE PASSWORD
            ======================================================== */}

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