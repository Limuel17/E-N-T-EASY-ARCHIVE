
import { useState } from "react";

import { NavLink, useLocation } from "react-router";

import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
  MdInventory2,
} from "react-icons/md";

import { RiAdminFill } from "react-icons/ri";

import { SiDevelopmentcontainers } from "react-icons/si";

import { VscDeveloperTools } from "react-icons/vsc";

const Sidebar = () => {
  const location = useLocation();

  /* ================================================================
     DEVELOPMENT
  ================================================================ */

  const isDevelopmentPage =
    location.pathname.startsWith(
      "/admin/development"
    );

  const [developmentOpen, setDevelopmentOpen] =
    useState(isDevelopmentPage);

  /* ================================================================
     INVENTORY
  ================================================================ */

  const isInventoryPage =
    location.pathname.startsWith(
      "/admin/inventory"
    );

  const [inventoryOpen, setInventoryOpen] =
    useState(isInventoryPage);

  /* ================================================================
     MOBILE
  ================================================================ */

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  /* ================================================================
     MAIN NAVIGATION STYLE
  ================================================================ */

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-300 hover:bg-slate-800 hover:text-white"
    }`;

  /* ================================================================
     DROPDOWN LINK STYLE
  ================================================================ */

  const dropdownLinkClass = ({
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
      {/* ============================================================ */}
      {/* MOBILE HEADER */}
      {/* ============================================================ */}

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

      {/* ============================================================ */}
      {/* MOBILE OVERLAY */}
      {/* ============================================================ */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================ */}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-slate-900 p-5 text-white shadow-xl
          transition-transform duration-300
          lg:w-64 lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ========================================================== */}
        {/* LOGO */}
        {/* ========================================================== */}

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

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-2xl text-gray-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <MdClose />
          </button>
        </div>

        {/* ========================================================== */}
        {/* NAVIGATION */}
        {/* ========================================================== */}

        <ul className="space-y-2">
          {/* ======================================================== */}
          {/* DASHBOARD */}
          {/* ======================================================== */}

          <li>
            <NavLink
              to="/admin/dashboard"
              end
              onClick={closeMobileMenu}
              className={navClass}
            >
              <MdDashboard className="text-xl" />

              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* ======================================================== */}
          {/* ADMIN MANAGEMENT */}
          {/* ======================================================== */}

          <li>
            <NavLink
              to="/admin/management"
              onClick={closeMobileMenu}
              className={navClass}
            >
              <RiAdminFill className="text-xl" />

              <span>Admin Management</span>
            </NavLink>
          </li>

          {/* ======================================================== */}
          {/* DEVELOPMENT */}
          {/* ======================================================== */}

          <li>
            <button
              type="button"
              onClick={() =>
                setDevelopmentOpen(
                  (previous) => !previous
                )
              }
              className={`
                flex w-full items-center
                justify-between rounded-lg
                px-4 py-3 transition
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
                  text-xl transition-transform
                  duration-200
                  ${
                    developmentOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* DEVELOPMENT DROPDOWN */}

            {developmentOpen && (
              <ul className="mt-1 space-y-1 pl-6 sm:pl-10">
                {/* FACTORY CARD */}

                <li>
                  <NavLink
                    to="/admin/development/factorycard"
                    end
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      dropdownLinkClass({
                        isActive,
                        extraActive:
                          location.pathname.startsWith(
                            "/admin/development/factorycard/"
                          ),
                      })
                    }
                  >
                    Factory Card
                  </NavLink>
                </li>

                {/* MACHINE OPERATION LOG */}

                <li>
                  <NavLink
                    to="/admin/development/machine-operation-log"
                    end
                    onClick={closeMobileMenu}
                    className={
                      dropdownLinkClass
                    }
                  >
                    Machine Operation Log
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* ======================================================== */}
          {/* INVENTORY */}
          {/* ======================================================== */}

          <li>
            <button
              type="button"
              onClick={() =>
                setInventoryOpen(
                  (previous) => !previous
                )
              }
              className={`
                flex w-full items-center
                justify-between rounded-lg
                px-4 py-3 transition
                ${
                  isInventoryPage
                    ? "bg-slate-800 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <MdInventory2 className="text-xl" />

                <span>Inventory</span>
              </div>

              <MdKeyboardArrowDown
                className={`
                  text-xl transition-transform
                  duration-200
                  ${
                    inventoryOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* INVENTORY DROPDOWN */}

            {inventoryOpen && (
              <ul className="mt-1 space-y-1 pl-6 sm:pl-10">
                {/* MILLED RUN SHEETS */}

                <li>
                  <NavLink
                    to="/admin/inventory/milled-run-sheets"
                    end
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      dropdownLinkClass({
                        isActive,
                        extraActive:
                          location.pathname.startsWith(
                            "/admin/inventory/milled-run-sheets/"
                          ),
                      })
                    }
                  >
                    Milled Run Sheets
                  </NavLink>
                </li>

                {/* CONSUMABLES */}

                <li>
                  <NavLink
                    to="/admin/inventory/consumables"
                    end
                    onClick={closeMobileMenu}
                    className={
                      dropdownLinkClass
                    }
                  >
                    Consumables
                  </NavLink>
                </li>

                {/* TOOLS */}

                <li>
                  <NavLink
                    to="/admin/inventory/tools"
                    end
                    onClick={closeMobileMenu}
                    className={
                      dropdownLinkClass
                    }
                  >
                    Tools
                  </NavLink>
                </li>

                {/* PAPER ROLL */}

                <li>
                  <NavLink
                    to="/admin/inventory/paper-roll"
                    end
                    onClick={closeMobileMenu}
                    className={
                      dropdownLinkClass
                    }
                  >
                    Paper Roll
                  </NavLink>
                </li>

                {/* FINISHED GOODS */}

                <li>
                  <NavLink
                    to="/admin/inventory/finished-goods"
                    end
                    onClick={closeMobileMenu}
                    className={
                      dropdownLinkClass
                    }
                  >
                    Finished Goods
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* ======================================================== */}
          {/* TICKET */}
          {/* ======================================================== */}

          <li>
            <NavLink
              to="/admin/ticket"
              onClick={closeMobileMenu}
              className={navClass}
            >
              <VscDeveloperTools className="text-xl" />

              <span>Ticket</span>
            </NavLink>
          </li>
        </ul>

        {/* ========================================================== */}
        {/* FOOTER */}
        {/* ========================================================== */}

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

export default Sidebar;

