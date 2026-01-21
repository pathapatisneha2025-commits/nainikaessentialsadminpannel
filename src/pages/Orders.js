import React, { useEffect, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetch("https://nainikaessentialsdatabas.onrender.com/orders/")
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.order_id.toString().includes(search) ||
      o.user_id.toString().includes(search)
  );

  return (
    <div className="container">
      <h1>Orders</h1>

      {/* Search */}
      <div className="search">
        <LuSearch />
        <input
          placeholder="Search Order ID / User ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table (Desktop + Mobile) */}
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
            {filtered.map((o) => (
              <tr key={o.order_id}>
                <td>#{o.order_id}</td>
                <td>{o.user_id}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>{o.payment_method.toUpperCase()}</td>
                <td>₹{o.total_amount}</td>
                <td>
                  <span className={`status ${o.order_status.toLowerCase()}`}>
                    {o.order_status}
                  </span>
                </td>
                <td>
                  <button onClick={() => setSelectedOrder(o)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="modal">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Order #{selectedOrder.order_id}</h3>
              <LuX onClick={() => setSelectedOrder(null)} />
            </div>

            {(() => {
              const a = JSON.parse(selectedOrder.shipping_address);
              return (
                <>
                  <p><b>Name:</b> {a.name}</p>
                  <p><b>Phone:</b> {a.phone}</p>
                  <p><b>Address:</b> {a.street}, {a.city}, {a.state}</p>
                  <p><b>Pincode:</b> {a.pincode}</p>
                  <p><b>Payment:</b> {selectedOrder.payment_method}</p>
                  <p><b>Total:</b> ₹{selectedOrder.total_amount}</p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; }

        .container {
          padding: 16px;
          background: #f8fafc;
          font-family: Inter, sans-serif;
          min-height: 100vh;
        }

        h1 { color: #1d4ed8; }

        .search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e0f2fe;
          padding: 12px;
          border-radius: 12px;
          max-width: 400px;
          margin-bottom: 16px;
        }

        .search input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 14px;
        }

        table {
          width: 100%;
          min-width: 700px; /* KEY for mobile scroll */
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          white-space: nowrap;
        }

        th {
          background: #f1f5ff;
          color: #1d4ed8;
        }

        button {
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          background: #e0f2fe;
          color: #1d4ed8;
          cursor: pointer;
        }

        .status {
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 600;
        }

        .pending { background: #fef3c7; color: #92400e; }
        .completed { background: #dcfce7; color: #166534; }

        /* Modal */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-box {
          background: white;
          padding: 20px;
          border-radius: 16px;
          width: 90%;
          max-width: 420px;
          max-height: 85vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Mobile tweaks */
        @media (max-width: 768px) {
          th, td {
            padding: 10px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
