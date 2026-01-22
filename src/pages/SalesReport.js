import React, { useEffect, useState } from "react";

export default function SalesReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const lowStockThreshold = 20; // Low stock warning
  const criticalStockThreshold = 5; // Critical stock warning

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(
          "https://nainikaessentialsdatabas.onrender.com/orders/sales"
        );
        const data = await res.json();
        setReport(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <p>Loading sales report...</p>;
  if (!report) return <p>No data available.</p>;

  const { highestSelling, lowestSelling, allProducts = [] } = report;

  // Helper: get stock status and generate alerts
  const getStockStatus = (product) => {
    if (!product.variants) return { status: "Unknown", color: "gray" };

    let variants = [];
    try {
      variants = typeof product.variants === "string"
        ? JSON.parse(product.variants)
        : product.variants;
      if (!Array.isArray(variants)) variants = [];
    } catch {
      variants = [];
    }

    if (variants.length === 0) return { status: "Unknown", color: "gray" };

    const minStock = Math.min(...variants.map((v) => v.stock || 0));

    if (minStock <= criticalStockThreshold)
      return { status: `Critical (${minStock} left)`, color: "red" };
    if (minStock <= lowStockThreshold)
      return { status: `Low (${minStock} left)`, color: "orange" };

    return { status: `Good (${minStock} left)`, color: "green" };
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
      <h1>Sales & Stock Report</h1>

      {/* Highest & Lowest Selling */}
      <div style={{ marginTop: "20px" }}>
        <h2>Highest Selling Product</h2>
        {highestSelling ? (
          <p>
            <b>{highestSelling.name}</b> - Units Sold: {highestSelling.totalSold}
          </p>
        ) : (
          <p>No products sold yet.</p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Lowest Selling Product</h2>
        {lowestSelling ? (
          <p>
            <b>{lowestSelling.name}</b> - Units Sold: {lowestSelling.totalSold}
          </p>
        ) : (
          <p>No products sold yet.</p>
        )}
      </div>

      {/* Stock Alerts */}
      <div style={{ marginTop: "30px" }}>
        <h2>All Products & Stock Alerts</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Product</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Category</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Units Sold</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Stock Status</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Alert</th>
            </tr>
          </thead>
          <tbody>
            {allProducts.map((p) => {
              const stock = getStockStatus(p);
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.totalSold}</td>
                  <td style={{ color: stock.color, fontWeight: "bold" }}>
                    {stock.status}
                  </td>
                  <td>
                    {stock.color === "red" && (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        ⚠️ Reorder immediately!
                      </span>
                    )}
                    {stock.color === "orange" && (
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        ⚠️ Low stock, consider reordering
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
