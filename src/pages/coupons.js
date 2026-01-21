import React, { useState, useEffect } from "react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    applicable_products: [],
    applicable_categories: [],
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch("https://nainikaessentialsdatabas.onrender.com/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch coupons.");
    }
  };

  // Fetch products & categories
 const fetchProducts = async () => {
  try {
    const res = await fetch("https://nainikaessentialsdatabas.onrender.com/products/all");
    const data = await res.json();
    console.log("Fetched products:", data); // <- check this in console
    setProducts(data); // or data.data if API wraps array
    const uniqueCategories = Array.from(new Set(data.map((p) => p.category)));
    setCategories(uniqueCategories);
  } catch (err) {
    console.error("Fetch products error:", err);
  }
};

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

const addCoupon = async () => {
  if (!form.code) return alert("Coupon code is required");
  if (!form.discount_value) return alert("Discount value is required");

  const payload = {
    ...form,
    discount_value: Number(form.discount_value), // ensures a number
    applicable_products: form.applicable_products,
    applicable_categories: form.applicable_categories,
  };

  try {
    const res = await fetch("https://nainikaessentialsdatabas.onrender.com/coupons/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        applicable_products: [],
        applicable_categories: [],
      });
      fetchCoupons();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add coupon.");
  }
};


  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await fetch(`https://nainikaessentialsdatabas.onrender.com/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Coupons Panel</h2>

      {/* Add Coupon Form */}
      <div style={styles.formContainer}>
        <h3 style={styles.subHeading}>Add New Coupon</h3>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Coupon Code</label>
            <input
              type="text"
              placeholder="SUMMER10"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Discount Type</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              style={styles.input}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Discount Value</label>
            <input
              type="number"
              placeholder="10"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              style={styles.input}
            />
          </div>

          {/* Products Multi-select */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Applicable Products</label>
            <select
              multiple
              value={form.applicable_products}
              onChange={(e) =>
                setForm({
                  ...form,
                  applicable_products: Array.from(e.target.selectedOptions, (o) => parseInt(o.value)),
                })
              }
              style={{ ...styles.input, height: "120px" }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categories Multi-select */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Applicable Categories</label>
            <select
              multiple
              value={form.applicable_categories}
              onChange={(e) =>
                setForm({
                  ...form,
                  applicable_categories: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              style={{ ...styles.input, height: "100px" }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={addCoupon} style={styles.addButton}>
          Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Products</th>
              <th style={styles.th}>Categories</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.code}</td>
                <td style={styles.td}>{c.discount_type}</td>
                <td style={styles.td}>{c.discount_value}</td>
                <td style={styles.td}>{c.applicable_products.join(", ")}</td>
                <td style={styles.td}>{c.applicable_categories.join(", ")}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteCoupon(c.id)} style={styles.deleteButton}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="6" style={styles.noData}>
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: { padding: "40px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f5f7", minHeight: "100vh" },
  heading: { fontSize: "28px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" },
  subHeading: { fontSize: "20px", fontWeight: "600", marginBottom: "20px" },
  formContainer: { backgroundColor: "#fff", padding: "25px", borderRadius: "10px", marginBottom: "35px", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px", marginBottom: "20px" },
  formGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "14px", fontWeight: "600", marginBottom: "5px", color: "#374151" },
  input: { padding: "10px", fontSize: "14px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" },
  addButton: { padding: "12px 25px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  tableContainer: { overflowX: "auto", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", backgroundColor: "#e0e7ff", textAlign: "left", fontSize: "14px", fontWeight: "600", borderBottom: "1px solid #c7d2fe" },
  td: { padding: "12px", fontSize: "14px", borderBottom: "1px solid #f3f4f6" },
  deleteButton: { padding: "6px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  noData: { textAlign: "center", padding: "20px", color: "#6b7280" },
};
