import React, { useEffect, useState } from "react";

const BASE_URL = "https://nainikaessentialsdatabas.onrender.com";

export default function AdminCodPanel() {
  const [codList, setCodList] = useState([]);
  const [codCharge, setCodCharge] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [message, setMessage] = useState("");

  // Fetch COD charges (limit 2 rows)
  const fetchCod = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cod/all`);
      const data = await res.json();
      setCodList(data.slice(0, 2));
      if (data.length > 0) setCodCharge(data[0].cod_charge);
    } catch {
      alert("Failed to load COD charges");
    }
  };

  useEffect(() => {
    fetchCod();
  }, []);

  // Save / Update COD
  const saveCodCharge = async () => {
    if (codCharge === "") return alert("Enter COD charge");

    try {
      let url = `${BASE_URL}/cod/add`;
      let method = "POST";

      if (codList.length > 0) {
        url = `${BASE_URL}/cod/update/${codList[0].id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cod_charge: Number(codCharge) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setMessage(data.message || "Saved successfully");
      fetchCod();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      alert("Error saving COD charge");
    }
  };

  // Update COD
  const updateCod = async (id) => {
    if (editValue === "") return alert("Enter COD charge");

    try {
      const res = await fetch(`${BASE_URL}/cod/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cod_charge: Number(editValue) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      alert(data.message || "Updated successfully");
      setEditingId(null);
      fetchCod();
    } catch {
      alert("Update failed");
    }
  };

  // Delete COD
  const deleteCod = async (id) => {
    if (!window.confirm("Delete this COD charge?")) return;

    try {
      const res = await fetch(`${BASE_URL}/cod/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error();

      alert(data.message || "Deleted successfully");
      fetchCod();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Cash On Delivery Charges</h1>

      {/* Add / Update Form */}
      <div style={styles.card}>
        <input
          type="number"
          value={codCharge}
          onChange={(e) => setCodCharge(e.target.value)}
          style={styles.input}
          placeholder="Enter COD charge"
        />
        <button onClick={saveCodCharge} style={styles.button}>
          Save / Update
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Small COD Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={{ ...styles.th, width: "40px" }}>ID</th>
              <th style={{ ...styles.th, width: "80px" }}>COD (₹)</th>
              <th style={{ ...styles.th, width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codList.length === 0 ? (
              <tr>
                <td colSpan="3" style={styles.empty}>
                  No COD charges
                </td>
              </tr>
            ) : (
              codList.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    ...styles.tr,
                    backgroundColor: index % 2 === 0 ? "#f9faff" : "#ffffff",
                  }}
                >
                  <td style={styles.td}>{item.id}</td>
                  <td style={styles.td}>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={styles.inputTable}
                      />
                    ) : (
                      `₹ ${item.cod_charge}`
                    )}
                  </td>
                  <td style={styles.td}>
                    {editingId === item.id ? (
                      <>
                        <button
                          style={{ ...styles.btn, ...styles.saveBtn }}
                          onClick={() => updateCod(item.id)}
                        >
                          Save
                        </button>
                        <button
                          style={{ ...styles.btn, ...styles.cancelBtn }}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{ ...styles.btn, ...styles.editBtn }}
                          onClick={() => {
                            setEditingId(item.id);
                            setEditValue(item.cod_charge);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{ ...styles.btn, ...styles.deleteBtn }}
                          onClick={() => deleteCod(item.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "10px", background: "#f4f8ff", minHeight: "100vh", fontFamily: "Inter, sans-serif" },
  title: { textAlign: "center", color: "#0b5ed7", marginBottom: "15px", fontSize: "clamp(18px, 5vw, 26px)", fontWeight: "700" },
  card: { background: "#fff", padding: "12px", borderRadius: "10px", boxShadow: "0 3px 12px rgba(0,0,0,0.08)", marginBottom: "15px" },
  input: { width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #cfd8e3", fontSize: "13px", outline: "none" },
  button: { width: "100%", background: "#0b5ed7", color: "#fff", padding: "8px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  message: { marginTop: "6px", textAlign: "center", color: "#198754", fontWeight: "600", fontSize: "12px" },
  tableWrapper: { overflowX: "auto", borderRadius: "8px", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "240px" },
  tableHeader: { backgroundColor: "#0b5ed7", color: "#fff" },
  th: { padding: "6px 8px", textAlign: "left", fontWeight: "600", fontSize: "12px" },
  tr: { transition: "background 0.2s" },
  td: { padding: "6px 8px", fontSize: "12px", verticalAlign: "middle" },
  inputTable: { width: "60px", padding: "4px 6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" },
  btn: { padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "600", marginRight: "4px", marginBottom: "2px", fontSize: "11px" },
  editBtn: { background: "#0b5ed7", color: "#fff" },
  saveBtn: { background: "#198754", color: "#fff" },
  cancelBtn: { background: "#6c757d", color: "#fff" },
  deleteBtn: { background: "#dc3545", color: "#fff" },
  empty: { textAlign: "center", padding: "10px", color: "#666", fontSize: "12px" },
};
