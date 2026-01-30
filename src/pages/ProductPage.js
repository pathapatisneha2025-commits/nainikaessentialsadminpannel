import React, { useState, useEffect } from "react";

const BASE_URL = "https://nainikaessentialsdatabas.onrender.com/products";

export default function AdminInventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const emptyProduct = {
    name: "",
    mainImage: null,
    thumbnails: [],
    variants: [{ size: "", color: "", price: "", stock: "" }],
    discount: "", // New field
     description: "",              // ✅ NEW
  productDetails: [{ key: "", value: "" }], // ✅ NEW
  };
  const [product, setProduct] = useState(emptyProduct);

  const lowStockThreshold = 20;
  const criticalStockThreshold = 5;
useEffect(() => {
  if (showModal) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
}, [showModal]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/all`);
        const data = await res.json();
        const uniqueCategories = [
          ...new Set(data.map((p) => p.category)),
        ].map((name, idx) => ({
          id: idx + 1,
          name,
          products: data.filter((p) => p.category === name),
        }));
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const allProducts = categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, categoryName: c.name }))
  );

  const displayedProducts =
    filterCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.categoryName === filterCategory);

  useEffect(() => {
    const newAlerts = [];
    displayedProducts.forEach((p) => {
      p.variants?.forEach((v) => {
        const stockStatus = getStockStatus(v);
        if (stockStatus.color !== "green") {
          newAlerts.push({
            product: p.name,
            variant: `${v.size}/${v.color}`,
            message: stockStatus.message,
            color: stockStatus.color,
          });
        }
      });
    });
    setAlerts(newAlerts);
  }, [displayedProducts]);

  const addCategory = () => {
    if (!newCategory) return;
    setCategories([
      ...categories,
      { id: Date.now(), name: newCategory, products: [] },
    ]);
    setNewCategory("");
  };

  const handleSetActiveCategory = (cat) => {
    setProduct(emptyProduct);
    setActiveCategory(cat);
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProduct({ ...product, mainImage: { file, url: URL.createObjectURL(file) } });
  };

  const handleThumbnails = (e) => {
    const files = Array.from(e.target.files);
    const thumbs = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setProduct({ ...product, thumbnails: [...product.thumbnails, ...thumbs] });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, { size: "", color: "", price: "", stock: "" }],
    });
  };

  const updateVariant = (i, field, value) => {
    const variants = [...product.variants];
    variants[i][field] = value;
    setProduct({ ...product, variants });
  };


  const saveProduct = async () => {
    if (!activeCategory) return alert("Select a category");
    if (!product.name) return alert("Enter product name");
const productDetailsObject = {};
product.productDetails.forEach(d => {
  if (d.key && d.value) productDetailsObject[d.key] = d.value;
});
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", activeCategory.name);
    formData.append("variants", JSON.stringify(product.variants));
    formData.append("discount", product.discount || 0);
// ✅ ADD THESE TWO LINES (YOU MISSED THIS)
  formData.append("description", product.description || "");
  formData.append("product_details", JSON.stringify(productDetailsObject));
    if (product.mainImage?.file) formData.append("mainImage", product.mainImage.file);
    product.thumbnails.forEach((thumb) => {
      if (thumb.file) formData.append("thumbnails", thumb.file);
    });
    

    try {
      setLoading(true);
      let res;
      if (editingProduct) {
        res = await fetch(`${BASE_URL}/update/${editingProduct.id}`, {
          method: "PUT",
          body: formData,
          
        });
      } else {
        res = await fetch(`${BASE_URL}/add`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await res.json();
      if (res.ok) {
        alert(editingProduct ? "Product updated!" : "Product added!");
        window.location.reload();
      } else {
        console.error("Backend error:", data);
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      await fetch(`${BASE_URL}/delete/${productId}`, { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const updateProduct = (prod) => {
  const cat = categories.find((c) => c.name === prod.category);
  setActiveCategory(cat);

  setProduct({
    name: prod.name,
    mainImage: { url: prod.main_image },
    thumbnails: prod.thumbnails
      ? prod.thumbnails.map((t) => ({ url: t }))
      : [],
    variants: prod.variants || [{ size: "", color: "", price: "", stock: "" }],
    discount: prod.discount || "",
    description: prod.description || "", // ✅ LOAD
   productDetails: prod.product_details
  ? Object.entries(prod.product_details).map(([key, value]) => ({ key, value }))
  : [{ key: "", value: "" }],
// ✅ LOAD
  });

  setEditingProduct(prod);
  setShowModal(true);
};


  const getStockStatus = (variant) => {
    const stock = Number(variant.stock) || 0;
    if (stock <= criticalStockThreshold)
      return { color: "red", message: "⚠️ Reorder immediately!" };
    if (stock <= lowStockThreshold)
      return { color: "orange", message: "⚠️ Low stock" };
    return { color: "green", message: "In Stock" };
  };

  const getDiscountedPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    return Math.round(p - (p * d) / 100);
  };
  const addProductDetail = () => {
  setProduct({
    ...product,
    productDetails: [...product.productDetails, { key: "", value: "" }],
  });
};

const updateProductDetail = (i, field, value) => {
  const details = [...product.productDetails];
  details[i][field] = value;
  setProduct({ ...product, productDetails: details });
};

const removeProductDetail = (i) => {
  const details = product.productDetails.filter((_, idx) => idx !== i);
  setProduct({ ...product, productDetails: details });
};


  return (
    <div className="admin">
      <h1>Inventory Management</h1>

      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((a, i) => (
            <div
              key={i}
              style={{
                background: a.color,
                padding: "8px",
                marginBottom: "6px",
                borderRadius: "6px",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              ⚠️ {a.product} ({a.variant}) - {a.message}
            </div>
          ))}
        </div>
      )}

      <div className="add-category-section">
        <div className="add-category">
          <input
            placeholder="Add New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="add-category-btn" onClick={addCategory}>
            ➕ Add
          </button>
        </div>
      </div>

      <div className="category-filter">
        <label>Filter by Category: </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card" onClick={() => handleSetActiveCategory(cat)}>
            {cat.name}
          </div>
        ))}
      </div>

      <h2>All Products</h2>
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Name</th>
              <th>Main Image</th>
              <th>Thumbnails</th>
              <th>Variants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.categoryName}</td>
                <td>{p.name}</td>
                <td>
                  {p.main_image && <img src={p.main_image} alt="main" className="mini-main" />}
                </td>
                <td className="thumbs">
                  {p.thumbnails?.map((t, j) => <img key={j} src={t} alt="thumb" />)}
                </td>
                <td>
                  {p.variants?.map((v, i) => {
                    const stockStatus = getStockStatus(v);
                    const finalPrice = getDiscountedPrice(v.price, p.discount);
                    return (
                      <div
                        key={i}
                        className="variant-tag"
                        style={{ color: stockStatus.color, fontWeight: "bold" }}
                        title={stockStatus.message}
                      >
                        {v.size}/{v.color} - ₹{v.price}
                        {p.discount ? ` → ₹${finalPrice} (-${p.discount}%)` : ""}
                        - Stock: {v.stock} {stockStatus.color !== "green" && stockStatus.message}
                      </div>
                    );
                  })}
                </td>
                <td className="action-cells">
                  <button className="update-btn" onClick={() => updateProduct(p)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product" : `Add Product to ${activeCategory?.name}`}</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <input
              className="full-input"
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />

            {/* Discount Input */}
            <input
              className="full-input"
              placeholder="Discount (%)"
              type="number"
              value={product.discount}
              onChange={(e) => setProduct({ ...product, discount: e.target.value })}
            />
            <textarea
  className="full-input"
  placeholder="Product Description"
  rows={4}
  value={product.description}
  onChange={(e) => setProduct({ ...product, description: e.target.value })}
/>
<h4 style={{ margin: "10px 0" }}>Product Details</h4>

{product.productDetails.map((d, i) => (
  <div key={i} className="variant-row">
    <input
      placeholder="Label (e.g. Fabric)"
      value={d.key}
      onChange={(e) => updateProductDetail(i, "key", e.target.value)}
    />
    <input
      placeholder="Value (e.g. Cotton)"
      value={d.value}
      onChange={(e) => updateProductDetail(i, "value", e.target.value)}
    />
    <button
      style={{ background: "#ef4444", color: "#fff", borderRadius: "6px" }}
      onClick={() => removeProductDetail(i)}
    >
      ✕
    </button>
  </div>
))}

<button className="add-variant-btn" onClick={addProductDetail}>
  + Add Product Detail
</button>


            <div className="upload-section">
              <label className="custom-upload">
                Upload Main Image
                <input type="file" onChange={handleMainImage} style={{ display: "none" }} />
              </label>
              {product.mainImage?.url && (
                <img src={product.mainImage.url} className="preview-img-main" alt="main" />
              )}

              <label className="custom-upload">
                Upload Thumbnails
                <input type="file" multiple onChange={handleThumbnails} style={{ display: "none" }} />
              </label>
              <div className="thumb-preview">
                {product.thumbnails.map((t, i) => <img key={i} src={t.url} alt="thumb" />)}
              </div>
            </div>

            <div>
              {product.variants.map((v, i) => (
                <div className="variant-row" key={i}>
                  <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} />
                  <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} />
                  <input placeholder="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
                  <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} />
                </div>
              ))}
              <button className="add-variant-btn" onClick={addVariant}>+ Add Variant</button>
            </div>

<button className="save-btn" onClick={saveProduct}>
  {editingProduct ? "Update Product" : "Save Product"}
</button>
          </div>
        </div>
      )}

<style>{`
/* ======= GLOBAL ======= */
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* prevent horizontal scroll */
  font-family: sans-serif;
  background: #f8fafc;
}

body.modal-open {
  overflow: hidden; /* freeze page when modal open */
  position: relative;
}

/* ======= PAGE ======= */
.admin {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
}

h1 {
  color: #0b5ed7;
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 20px;
}

/* ======= CATEGORY ======= */
.add-category {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.add-category input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.add-category button {
  background: #0b5ed7;
  color: #fff;
  border: none;
  padding: 0 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.category-card {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  font-weight: bold;
}

.category-filter {
  margin-bottom: 15px;
}

.category-filter select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* ======= ALERTS ======= */
.alerts-container > div {
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-weight: bold;
  color: #000;
}

/* ======= TABLE ======= */
.table-wrapper {
  width: 100%;
  overflow-x: auto; /* horizontal scroll only inside wrapper */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  background: #fff;
  border-radius: 12px;
  margin-top: 20px;
  box-sizing: border-box;
}

.product-table {
  width: max-content;
  border-collapse: collapse;
  table-layout: auto;
  min-width: 100%;
}

.product-table th,
.product-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  vertical-align: middle;
  white-space: normal;
  word-break: break-word;
}

.mini-main {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}

.thumbs img {
  width: 25px;
  height: 25px;
  margin-right: 4px;
  border-radius: 4px;
  object-fit: cover;
}

.variant-tag {
  display: inline-block;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  margin: 2px 2px 2px 0;
  font-weight: bold;
}

.action-cells {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* ======= MODAL ======= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 10px;
  overflow-y: auto;
}

.modal-box {
  background: #fff;
  width: 95%;
  max-width: 650px;
  max-height: 90vh;
  padding: 20px;
  border-radius: 16px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.close-x {
  font-size: 30px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

.full-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 16px;
}

/* ======= UPLOAD ======= */
.upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.custom-upload {
  display: block;
  background: #f8fafc;
  padding: 10px;
  text-align: center;
  border: 1px dashed #0b5ed7;
  border-radius: 8px;
  cursor: pointer;
  color: #0b5ed7;
  font-size: 14px;
}

.preview-img-main {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 6px;
}

.thumb-preview img {
  width: 35px;
  height: 35px;
  margin-right: 4px;
  border-radius: 4px;
  object-fit: cover;
}

/* ======= VARIANTS ======= */
.variant-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.variant-row input,
.variant-row select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.add-variant-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 2px solid #0b5ed7;
  color: #0b5ed7;
  background: #fff;
  border-radius: 8px;
  font-weight: bold;
}

.save-btn {
  width: 100%;
  padding: 14px;
  background: #0b5ed7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

/* ======= MOBILE ======= */
@media (max-width: 768px) {
  .modal-box {
    max-height: 90vh;
    width: 100%;
    padding: 15px;
  }
  .upload-section { grid-template-columns: 1fr; }
  .variant-row { grid-template-columns: 1fr 1fr; }
  .action-cells { flex-direction: column; gap: 6px; }
  .mini-main { width: 35px; height: 35px; }
  .thumbs img { width: 25px; height: 25px; }
  .variant-tag { font-size: 10px; max-width: 70px; padding: 2px 4px; }
  .product-table th,
  .product-table td { font-size: 12px; padding: 8px; }
  .table-wrapper { overflow-x: auto; }
  .product-table { min-width: unset; width: max-content; display: block; }
}
`}</style>



    </div>
  );
}
