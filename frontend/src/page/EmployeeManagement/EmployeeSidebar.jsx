import { useState } from "react";
import { NavLink, useLocation } from "react-router";

import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
} from "react-icons/md";

import { SiDevelopmentcontainers } from "react-icons/si";

import {
  VscDeveloperTools,
  VscFile,
} from "react-icons/vsc";

const EmployeeSidebar = () => {
  const location = useLocation();
  

  const isDevelopmentPage =
    location.pathname.startsWith("/employee/development");

  const [developmentOpen, setDevelopmentOpen] =
    useState(isDevelopmentPage);

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };




  // =========================
  // NAVIGATION CLASSES
  // =========================

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-300 hover:bg-slate-800 hover:text-white"
    }`;

  const developmentLinkClass = ({
    isActive,
    extraActive = false,
  }) =>
    `block rounded-lg px-3 py-2.5 text-sm transition ${
      isActive || extraActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center bg-slate-900 px-4 text-white shadow-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-2xl transition hover:bg-slate-800"
          aria-label="Open menu"
        >
          <MdMenu />
        </button>

        <span className="ml-3 text-lg font-bold">
          ENT System
        </span>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-slate-900 p-5 text-white shadow-xl
          transition-transform duration-300
          lg:w-64 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
              <VscDeveloperTools className="text-xl" />
            </div>

            <div>
              <p className="text-base font-bold text-white">
                ENT System
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Easy Archive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-2xl text-gray-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <MdClose />
          </button>
        </div>

        {/* NAVIGATION */}
        <ul className="space-y-2">
          {/* DASHBOARD */}
          <li>
            <NavLink
              to="/employee/dashboard"
              end
              onClick={closeMobileMenu}
              className={navClass}
            >
              <MdDashboard className="text-xl" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* DEVELOPMENT */}
          <li>
            <button
              type="button"
              onClick={() =>
                setDevelopmentOpen(
                  (previous) => !previous
                )
              }
              className={`
                flex w-full items-center justify-between
                rounded-lg px-4 py-3 transition
                ${
                  isDevelopmentPage
                    ? "bg-slate-800 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <SiDevelopmentcontainers className="text-xl" />

                <span>Development</span>
              </div>

              <MdKeyboardArrowDown
                className={`
                  text-xl transition-transform duration-200
                  ${
                    developmentOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {developmentOpen && (
              <ul className="mt-1 space-y-1 pl-6 sm:pl-10">
                {/* FACTORY CARD */}
                <li>
                  <NavLink
                    to="/employee/development/factorycard"
                    end
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      developmentLinkClass({
                        isActive,
                        extraActive:
                          location.pathname.startsWith(
                            "/employee/development/factorycard/"
                          ),
                      })
                    }
                  >
                    <div className="flex items-center gap-2">
                      <VscFile />
                      <span>Factory Card</span>
                    </div>
                  </NavLink>
                </li>

                {/* MACHINE OPERATION LOG */}
                <li>
                  <NavLink
                    to="/employee/development/machine-operation-log"
                    end
                    onClick={closeMobileMenu}
                    className={developmentLinkClass}
                  >
                    <div className="flex items-center gap-2">
                      <VscDeveloperTools />
                      <span>
                        Machine Operation Log
                      </span>
                    </div>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* REQUEST TICKET */}
          <li>
            <NavLink
              to="/employee/ticket"
              onClick={closeMobileMenu}
              className={navClass}
            >
              <VscFile className="text-xl" />
              <span>Request Ticket</span>
            </NavLink>
          </li>
        </ul>

        {/* BOTTOM SECTION */}

<div className="absolute bottom-5 left-5 right-5">
  <div className="border-t border-slate-800 pt-4">
    <p className="px-4 text-[10px] uppercase tracking-wider text-gray-500">
      E-N-T Easy Archive
    </p>
  </div>
</div>

      </aside>
    </>
  );
};

export default EmployeeSidebar;