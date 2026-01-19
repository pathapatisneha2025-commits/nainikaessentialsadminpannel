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

      <div className="search">
        <LuSearch />
        <input
          placeholder="Search Order ID / User ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
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

      {/* Mobile Cards */}
      <div className="cards">
        {filtered.map((o) => (
          <div className="card" key={o.order_id}>
            <div>
              <b>Order:</b> #{o.order_id}
            </div>
            <div>
              <b>User:</b> {o.user_id}
            </div>
            <div>
              <b>Date:</b>{" "}
              {new Date(o.created_at).toLocaleDateString()}
            </div>
            <div>
              <b>Total:</b> ₹{o.total_amount}
            </div>
            <span className={`status ${o.order_status.toLowerCase()}`}>
              {o.order_status}
            </span>
            <button onClick={() => setSelectedOrder(o)}>View</button>
          </div>
        ))}
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
        body { margin: 0; }

        .container {
          padding: 16px;
          background: #f8fafc;
          font-family: Inter, sans-serif;
          min-height: 100vh;
        }

        h1 { color: #1d4ed8; }

        .search {
          display: flex;
          gap: 8px;
          background: #e0f2fe;
          padding: 10px;
          border-radius: 10px;
          max-width: 300px;
          margin-bottom: 16px;
        }

        .search input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
        }

        /* Table */
        .table-wrapper { overflow-x: auto; }
        table {
          width: 100%;
          background: white;
          border-radius: 12px;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
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

        button:hover {
          background: #1d4ed8;
          color: white;
        }

        .status {
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .pending {
          background: #fef3c7;
          color: #92400e;
        }

        .completed {
          background: #dcfce7;
          color: #166534;
        }

        /* Mobile Cards */
        .cards { display: none; gap: 12px; }

        .card {
          background: white;
          padding: 14px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Modal */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-box {
          background: white;
          padding: 20px;
          border-radius: 16px;
          width: 90%;
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .table-wrapper { display: none; }
          .cards { display: flex; }
        }
      `}</style>
    </div>
  );
}
