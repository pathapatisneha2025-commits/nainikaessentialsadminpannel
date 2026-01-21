import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuShoppingBag,
  LuPackage,
  LuMenu,
  LuX,
  LuLogOut,
} from "react-icons/lu";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = location.pathname.split("/").pop() || "dashboard";

  const handleLogout = () => {
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LuLayoutDashboard />, path: "/admin/dashboard" },
    { id: "products", label: "Products", icon: <LuPackage />, path: "/admin/products" },
    { id: "orders", label: "Orders", icon: <LuShoppingBag />, path: "/admin/orders" },
    { id: "coupons", label: "coupons", icon: <LuShoppingBag />, path: "/admin/coupons" },

    { id: "logout", label: "Logout", icon: <LuLogOut />, action: handleLogout },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="admin-container">
      {/* Mobile Toggle */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <LuX size={22} /> : <LuMenu size={22} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          Nainika<span>Essentials</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => {
                item.action ? item.action() : navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <Outlet />
      </main>

      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f4f8ff;
          font-family: "Inter", sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0b5ed7, #084298);
          color: white;
          padding: 28px 20px;
          height: 100vh;
          position: sticky;
          top: 0;
          transition: transform 0.3s ease;
        }

        .sidebar-logo {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 40px;
          letter-spacing: 1px;
        }

        .sidebar-logo span {
          display: block;
          font-size: 12px;
          font-weight: 500;
          opacity: 0.85;
        }

        .sidebar-nav button {
          width: 100%;
          background: transparent;
          border: none;
          color: #e0eaff;
          padding: 14px 16px;
          margin-bottom: 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 15px;
          cursor: pointer;
          transition: 0.25s;
        }

        .sidebar-nav button:hover {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .sidebar-nav button.active {
          background: white;
          color: #0b5ed7;
          font-weight: 600;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        }

        /* Main content */
        .main-content {
          flex: 1;
          padding: 40px;
        }

        /* Mobile toggle */
        .mobile-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          background: #0b5ed7;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          z-index: 1001;
          cursor: pointer;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            z-index: 1000;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .mobile-toggle {
            display: block;
          }

          .main-content {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
