import React, { useState, useEffect } from "react";

const BestSellersAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [variants, setVariants] = useState([{ size: "", color: "", price: 0, stock: 0 }]);
  const [type, setType] = useState("bestseller"); // <-- type state

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://nainikaessentialsdatabas.onrender.com/bestseller/all");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Load product for edit
  const loadForEdit = async (id) => {
    try {
      const res = await fetch(`https://nainikaessentialsdatabas.onrender.com/bestseller/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      setName(data.name);
      setCategory(data.category);
      setDescription(data.description);
      setVariants(data.variants || []);
      setType(data.type || "bestseller");
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`https://nainikaessentialsdatabas.onrender.com/bestseller/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("variants", JSON.stringify(variants));
    formData.append("type", type); // <-- append type
    if (mainImage) formData.append("mainImage", mainImage);
    thumbnails.forEach(file => formData.append("thumbnails", file));

    try {
      let res;
      if (editingId) {
        res = await fetch(`https://nainikaessentialsdatabas.onrender.com/bestseller/update/${editingId}`, { method: "PUT", body: formData });
      } else {
        res = await fetch("https://nainikaessentialsdatabas.onrender.com/bestseller/add", { method: "POST", body: formData });
      }
      if (!res.ok) throw new Error("Failed to submit form");

      // Reset form
      setName(""); setCategory(""); setDescription(""); setType("bestseller");
      setMainImage(null); setThumbnails([]);
      setVariants([{ size: "", color: "", price: 0, stock: 0 }]);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Variant handlers
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };
  const addVariant = () => setVariants([...variants, { size: "", color: "", price: 0, stock: 0 }]);
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  // Styles
  const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f4f8", color: "#0a3d62", minHeight: "100vh" },
    button: { backgroundColor: "#0a3d62", color: "white", border: "none", padding: "8px 16px", cursor: "pointer", borderRadius: "4px" },
    deleteButton: { backgroundColor: "#e74c3c", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    th: { backgroundColor: "#0a3d62", color: "white", padding: "10px", textAlign: "left" },
    td: { border: "1px solid #ccc", padding: "8px", verticalAlign: "top" },
    formContainer: { marginTop: "20px", padding: "20px", border: "1px solid #0a3d62", borderRadius: "6px", backgroundColor: "white" },
    input: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" },
    textarea: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" },
    variantRow: { display: "flex", gap: "10px", marginBottom: "5px" },
    h2: { color: "#0a3d62" },
    h3: { color: "#0a3d62" },
    h4: { color: "#0a3d62" },
    imageThumb: { width: "60px", height: "60px", objectFit: "cover", marginRight: "5px", borderRadius: "4px" }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Product Admin Panel</h2>
      <button style={styles.button} onClick={() => { setShowForm(true); setEditingId(null); }}>
        Add New Product
      </button>

      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.h3}>{editingId ? "Edit" : "Add"} Product</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input style={styles.input} type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input style={styles.input} type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <textarea style={styles.textarea} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

            {/* Type selector */}
            <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
              <option value="bestseller">Best Seller</option>
              <option value="featured">Featured</option>
              <option value="newarrival">New Arrival</option>
            </select>

            <input type="file" onChange={e => setMainImage(e.target.files[0])} />
            <input type="file" multiple onChange={e => setThumbnails([...e.target.files])} />

            <h4 style={styles.h4}>Variants</h4>
            {variants.map((v, i) => (
              <div key={i} style={styles.variantRow}>
                <input style={styles.input} placeholder="Size" value={v.size} onChange={e => handleVariantChange(i, "size", e.target.value)} />
                <input style={styles.input} placeholder="Color" value={v.color} onChange={e => handleVariantChange(i, "color", e.target.value)} />
                <input style={styles.input} placeholder="Price" type="number" value={v.price} onChange={e => handleVariantChange(i, "price", e.target.value)} />
                <input style={styles.input} placeholder="Stock" type="number" value={v.stock} onChange={e => handleVariantChange(i, "stock", e.target.value)} />
                <button type="button" style={styles.deleteButton} onClick={() => removeVariant(i)}>Remove</button>
              </div>
            ))}
            <button type="button" style={styles.button} onClick={addVariant}>Add Variant</button>

            <button type="submit" style={styles.button}>{editingId ? "Update" : "Add"} Product</button>
            <button type="button" style={{ ...styles.button, backgroundColor: "#7f8c8d" }} onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div>
        <h3 style={styles.h3}>Existing Products</h3>
        {products.length === 0 ? <p>No products found.</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Main Image</th>
                <th style={styles.th}>Thumbnails</th>
                <th style={styles.th}>Variants</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>{p.type}</td>
                  <td style={styles.td}>{p.main_image && <img src={p.main_image} alt="main" style={styles.imageThumb} />}</td>
                  <td style={styles.td}>{p.thumbnails?.map((t, idx) => <img key={idx} src={t} alt="thumb" style={styles.imageThumb} />)}</td>
                  <td style={styles.td}>
                    {p.variants?.map((v, idx) => (
                      <div key={idx}>
                        Size: {v.size}, Color: {v.color}, Price: ₹{v.price}, Stock: {v.stock}
                      </div>
                    ))}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.button} onClick={() => loadForEdit(p.id)}>Edit</button>
                    <button style={{ ...styles.deleteButton, marginLeft: "10px" }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BestSellersAdmin;
