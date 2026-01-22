import React, { useEffect, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import jsPDF from "jspdf";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const GST_RATE = 0.18; // 18% GST

  // Fetch orders from backend and normalize items as array
  useEffect(() => {
    fetch("https://nainikaessentialsdatabas.onrender.com/orders/")
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
        }));
        setOrders(normalized);
      })
      .catch(console.error);
  }, []);

  // Filter orders by search
  const filtered = orders.filter(
    (o) =>
      o.order_id.toString().includes(search) ||
      o.user_id.toString().includes(search)
  );

  // Ship order handler
  const handleShipOrder = async (orderId) => {
    try {
      const res = await fetch(
        `https://nainikaessentialsdatabas.onrender.com/orders/${Number(
          orderId
        )}/ship`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to create shipment");
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === updatedOrder.order_id ? updatedOrder : o
        )
      );

      alert("Shipment created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating shipment");
    }
  };

  // Generate invoice PDF
  const generateInvoice = (order) => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text(`Invoice - Order #${order.order_id}`, 10, y);
    y += 10;

    doc.setFontSize(12);

    let address = {};
    try {
      address = JSON.parse(order.shipping_address || "{}");
    } catch (err) {
      console.error("Invalid shipping address", err);
    }

    doc.text(`Customer: ${address.name || "-"}`, 10, y);
    y += 6;
    doc.text(`Phone: ${address.phone || "-"}`, 10, y);
    y += 6;
    doc.text(`Email: ${order.customer_email || "-"}`, 10, y);
    y += 10;

    doc.text("Products:", 10, y);
    y += 8;

    let subtotal = 0;

    const items = order.products || [];
    if (items.length === 0) {
      doc.text("No products found", 10, y);
      y += 6;
    } else {
      items.forEach((p, idx) => {
        const quantity = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const totalPrice = price * quantity;
        subtotal += totalPrice;

        const variantText = p.variant
          ? ` (${p.variant.size || ""}/${p.variant.color || ""})`
          : "";
        doc.text(
          `${idx + 1}. ${p.name}${variantText} x${quantity} - ₹${totalPrice.toFixed(
            2
          )}`,
          10,
          y
        );
        y += 6;
      });
    }

    y += 4;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`GST @${(GST_RATE * 100).toFixed(0)}%: ₹${gst.toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`Total: ₹${total.toFixed(2)}`, 10, y);

    doc.save(`Invoice_Order_${order.order_id}.pdf`);
  };

  // ----- RETURN MANAGEMENT -----
  const handleReturnRequest = async (orderId, productId) => {
    try {
      const res = await fetch(
        `https://nainikaessentialsdatabas.onrender.com/orders/${orderId}/return-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }
      );
      if (!res.ok) throw new Error("Return request failed");
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === updatedOrder.order_id ? updatedOrder : o
        )
      );

      alert("Return requested successfully!");
    } catch (err) {
      console.error(err);
      alert("Error requesting return");
    }
  };

const handleReturnDecision = async (orderId, approve = true) => {
  try {
    const res = await fetch(
      `https://nainikaessentialsdatabas.onrender.com/orders/admin/returns/${orderId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: approve ? "approve" : "reject",
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Return update failed");

    // Update UI locally for all items
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.order_id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) => ({
            ...item,
            return_status: approve ? "Approved" : "Rejected",
          })),
        };
      })
    );

    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Error updating return: " + err.message);
  }
};





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
              <th>Shipping</th>
              <th>Return</th>
              <th>Invoice</th>
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
                  {o.shipping_status &&
                  o.shipping_status !== "Not shipped" ? (
                    <span
                      className={`status ${o.shipping_status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {o.shipping_status} ({o.tracking_number || "-"})
                    </span>
                  ) : (
                    <button onClick={() => handleShipOrder(o.order_id)}>
                      Ship Order
                    </button>
                  )}
                </td>
<td>
  {Array.isArray(o.items) && o.items.length > 0 ? (
    (() => {
      const firstItem = o.items[0];
      const returnStatus = firstItem.return_status || "Not Requested";
      const returnReason = firstItem.return_reason;

      if (returnStatus === "Requested") {
        return (
          <>
            <button onClick={() => handleReturnDecision(o.order_id, true)}>
              Approve
            </button>
            <button onClick={() => handleReturnDecision(o.order_id, false)}>
              Reject
            </button>
          </>
        );
      } else if (returnStatus === "Approved") {
        return <span style={{ color: "green", fontWeight: 600 }}>Approved</span>;
      } else if (returnStatus === "Rejected") {
        return <span style={{ color: "red", fontWeight: 600 }}>Rejected</span>;
      } else {
        return <span style={{ color: "#64748b", fontSize: 12 }}>No return request</span>;
      }
    })()
  ) : (
    <span style={{ color: "#64748b", fontSize: 12 }}>No items</span>
  )}

  {/* Show reason if available */}
  {Array.isArray(o.items) && o.items.length > 0 && o.items[0].return_reason && (
    <div style={{ fontSize: "11px", color: "#64748b", marginTop: 2 }}>
      Reason: {o.items[0].return_reason}
    </div>
  )}
</td>


                <td>
                  <button onClick={() => generateInvoice(o)}>
                    Generate Invoice
                  </button>
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
                  <p>
                    <b>Name:</b> {a.name}
                  </p>
                  <p>
                    <b>Phone:</b> {a.phone}
                  </p>
                  <p>
                    <b>Address:</b> {a.street}, {a.city}, {a.state}
                  </p>
                  <p>
                    <b>Pincode:</b> {a.pincode}
                  </p>
                  <p>
                    <b>Payment:</b> {selectedOrder.payment_method}
                  </p>
                  <p>
                    <b>Total:</b> ₹{selectedOrder.total_amount}
                  </p>
                  <p>
                    <b>Shipping Status:</b>{" "}
                    {selectedOrder.shipping_status || "Not shipped"}
                  </p>
                  {selectedOrder.tracking_number && (
                    <p>
                      <b>Tracking Number:</b> {selectedOrder.tracking_number}
                    </p>
                  )}
                  <p>
                    <b>Courier:</b> {selectedOrder.courier_service || "-"}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; }
        .container { padding: 16px; background: #f8fafc; font-family: Inter, sans-serif; min-height: 100vh; }
        h1 { color: #1d4ed8; }
        .search { display: flex; align-items: center; gap: 8px; background: #e0f2fe; padding: 12px; border-radius: 12px; max-width: 400px; margin-bottom: 16px; }
        .search input { border: none; background: transparent; outline: none; width: 100%; }
        .table-wrapper { overflow-x: auto; background: white; border-radius: 14px; }
        table { width: 100%; min-width: 900px; border-collapse: collapse; }
        th, td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; white-space: nowrap; }
        th { background: #f1f5ff; color: #1d4ed8; }
        button { padding: 6px 12px; border-radius: 8px; border: none; background: #e0f2fe; color: #1d4ed8; cursor: pointer; margin: 2px; }
        .status { padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 600; }
        .pending { background: #fef3c7; color: #92400e; }
        .completed { background: #dcfce7; color: #166534; }
        .not-shipped { background: #fef3c7; color: #92400e; }
        .shipped { background: #dcfce7; color: #166534; }
        .delivered { background: #c7f0fe; color: #0369a1; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
        .modal-box { background: white; padding: 20px; border-radius: 16px; width: 90%; max-width: 420px; max-height: 85vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) { th, td { padding: 10px; font-size: 13px; } }
      `}</style>
    </div>
  );
}
