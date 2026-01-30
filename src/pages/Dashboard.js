import React, { useEffect, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { FiShoppingBag, FiUsers, FiTruck, FiDollarSign } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterType, setFilterType] = useState(""); // pending, cod, or ""

  useEffect(() => {
    fetch("https://nainikaessentialsdatabas.onrender.com/orders/")
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  // Stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;
  const codOrders = orders.filter((o) => o.payment_method === "cod").length;

  // Combined filter: search + card filter
  const filtered = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      o.order_id.toString().includes(searchLower) ||
      o.user_id.toString().includes(searchLower) ||
      o.payment_method.toLowerCase().includes(searchLower) ||
      o.order_status.toLowerCase().includes(searchLower);

    const matchesCard =
      filterType === "pending"
        ? o.order_status === "Pending"
        : filterType === "cod"
        ? o.payment_method === "cod"
        : true;

    return matchesSearch && matchesCard;
  });

  // Excel export
  const exportToExcel = () => {
  const data = filtered.map((o) => {
    const addr = JSON.parse(o.shipping_address || "{}");

    // Ensure items is an array
    const itemsArray = Array.isArray(o.items) ? o.items : [];

    return {
      OrderID: o.order_id,
      UserID: o.user_id,
      Date: new Date(o.created_at).toLocaleDateString(),
      Payment: o.payment_method.toUpperCase(),
      Total: o.total_amount,
      Status: o.order_status,
      Name: addr.name || "",
      Phone: addr.phone || "",
      Street: addr.street || "",
      City: addr.city || "",
      State: addr.state || "",
      Pincode: addr.pincode || "",
      Products: itemsArray.map(i => `${i.product_name || "N/A"} (Qty:${i.quantity})`).join(", ")
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "Orders.xlsx");
};


  return (
    <div className="dashboard">
      {/* Header */}
      <header className="topbar">
        <h1>NainikaEssentials Admin</h1>
        <span className="subtitle">Dashboard Overview</span>
      </header>

      {/* Stats Cards */}
      <div className="stats">
        <div className={`stat-card ${filterType === "" ? "active" : ""}`} onClick={() => setFilterType("")}>
          <FiShoppingBag />
          <div>
            <p>Total Orders</p>
            <h3>{totalOrders}</h3>
          </div>
        </div>

        <div className={`stat-card ${filterType === "" ? "active" : ""}`} onClick={() => setFilterType("")}>
          <FiDollarSign />
          <div>
            <p>Total Revenue</p>
            <h3>₹{totalRevenue}</h3>
          </div>
        </div>

        <div className={`stat-card ${filterType === "pending" ? "active" : ""}`} onClick={() => setFilterType("pending")}>
          <FiTruck />
          <div>
            <p>Pending Orders</p>
            <h3>{pendingOrders}</h3>
          </div>
        </div>

        <div className={`stat-card ${filterType === "cod" ? "active" : ""}`} onClick={() => setFilterType("cod")}>
          <FiUsers />
          <div>
            <p>COD Orders</p>
            <h3>{codOrders}</h3>
          </div>
        </div>
      </div>

      {/* Export Excel Button */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={exportToExcel}
          style={{
            padding: "8px 16px",
            background: "#1d4ed8",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download Excel
        </button>
      </div>

      {/* Orders Section */}
      <div className="orders-section">
        <div className="orders-header">
          <h2>Recent Orders</h2>
          <div className="search">
            <LuSearch />
            <input
              placeholder="Search Order / User / Payment / Status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const firstItem = o.items[0]; // get first item if exists
                const productName = firstItem?.product_name || "N/A";
                const productImage = firstItem?.product_image || "/placeholder.png";

                return (
                  <tr key={o.order_id}>
                    <td>
                      #{o.order_id}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <img
                          src={productImage}
                          alt={productName}
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                        />
                        <span style={{ fontSize: "13px", color: "#1f2937" }}>{productName}</span>
                      </div>
                    </td>
                    <td>{o.user_id}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>{o.payment_method.toUpperCase()}</td>
                    <td>₹{o.total_amount}</td>
                    <td>
                      <span className={`status ${o.order_status.toLowerCase()}`}>{o.order_status}</span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedOrder(o)}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="modal">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Order #{selectedOrder.order_id}</h3>
              <LuX onClick={() => setSelectedOrder(null)} style={{ cursor: "pointer" }} />
            </div>
            {(() => {
              const a = JSON.parse(selectedOrder.shipping_address);
              return (
                <>
                  <p><b>Name:</b> {a.name}</p>
                  <p><b>Phone:</b> {a.phone}</p>
                  <p><b>Address:</b> {a.street}, {a.city}, {a.state}</p>
                  <p><b>Pincode:</b> {a.pincode}</p>
                  <p><b>Payment:</b> {selectedOrder.payment_method.toUpperCase()}</p>
                  <p><b>Total:</b> ₹{selectedOrder.total_amount}</p>
                  <div style={{ marginTop: "12px" }}>
                    <h4>Products:</h4>
                    {selectedOrder.items.length > 0
                      ? selectedOrder.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                              />
                            )}
                            <div>
                              <p style={{ margin: 0 }}><b>{item.product_name || "N/A"}</b></p>
                              <small>Qty: {item.quantity}</small> | <small>Size: {item.size}</small> | <small>Color: {item.color}</small>
                            </div>
                          </div>
                        ))
                      : <p>No products in this order</p>}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
   


      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .dashboard { padding: 16px; font-family: Inter, sans-serif; background: #f8fafc; min-height: 100vh; }

        .topbar h1 { color: #1d4ed8; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 14px; }

        /* Stats */
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0; }
        .stat-card { background: white; padding: 16px; border-radius: 16px; display: flex; gap: 12px; align-items: center; box-shadow: 0 6px 18px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; }
        .stat-card svg { font-size: 24px; color: #1d4ed8; }
        .stat-card p { margin: 0; color: #64748b; font-size: 13px; }
        .stat-card h3 { margin: 0; color: #0f172a; }
        .stat-card.active { border: 2px solid #1d4ed8; }

        /* Orders */
        .orders-section { background: white; border-radius: 18px; padding: 16px; }
        .orders-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 12px; }
        .search { display: flex; gap: 8px; background: #e0f2fe; padding: 8px 12px; border-radius: 10px; }
        .search input { border: none; background: transparent; outline: none; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f1f5ff; color: #1d4ed8; }
        button { padding: 6px 12px; border-radius: 8px; border: none; background: #e0f2fe; cursor: pointer; color: #1d4ed8; }
        button:hover { background: #1d4ed8; color: white; }
        .status { padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 600; }
        .pending { background: #fef3c7; color: #92400e; }
        .completed { background: #dcfce7; color: #166534; }

        /* Modal */
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
        .modal-box { background: white; padding: 20px; border-radius: 16px; width: 90%; max-width: 400px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
      `}</style>
    </div>
  );
}
