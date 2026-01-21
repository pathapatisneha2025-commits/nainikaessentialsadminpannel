import React, { useState, useEffect } from "react";

const BASE_URL = "https://nainikaessentialsdatabas.onrender.com/products";

export default function AdminInventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyProduct = {
    name: "",
    mainImage: null,
    thumbnails: [],
    variants: [{ size: "", color: "", price: "", stock: "" }],
  };
  const [product, setProduct] = useState(emptyProduct);

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

  const addCategory = () => {
    if (!newCategory) return;
    setCategories([
      ...categories,
      { id: Date.now(), name: newCategory, products: [] },
    ]);
    setNewCategory("");
  };

  const handleSetActiveCategory = (cat) => setActiveCategory(cat);

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
    if (!activeCategory) return;

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", activeCategory.name);
    formData.append("variants", JSON.stringify(product.variants));
    if (product.mainImage?.file) formData.append("mainImage", product.mainImage.file);
    product.thumbnails.forEach((thumb) => thumb.file && formData.append("thumbnails", thumb.file));

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/add`, { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        alert("Product added successfully!");
        setCategories(
          categories.map((c) =>
            c.id === activeCategory.id
              ? { ...c, products: [...c.products, data.product] }
              : c
          )
        );
        setProduct(emptyProduct);
      } else {
        alert(data.error || "Error adding product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/delete/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert("Product deleted!");
        setCategories(
          categories.map((c) =>
            c.id === activeCategory.id
              ? { ...c, products: c.products.filter((p) => p.id !== productId) }
              : c
          )
        );
      } else {
        alert(data.error || "Error deleting product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (prod) => {
    setActiveCategory(categories.find((c) => c.name === prod.category));
    setProduct({
      name: prod.name,
      mainImage: { url: prod.main_image },
      thumbnails: prod.thumbnails.map((t) => ({ url: t })),
      variants: prod.variants || [{ size: "", color: "", price: "", stock: "" }],
    });
  };

  return (
    <div className="admin">
      <h1>Inventory Management</h1>

      {/* ADD CATEGORY */}
      <div className="add-category">
        <input
          placeholder="Add Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="add-category-btn" onClick={addCategory}>➕ Add Category</button>
      </div>

      {/* CATEGORY CARDS */}
      <div className="category-grid">
        {categories.length === 0 && <p>No categories available</p>}
        {categories.map((cat) => (
          <div key={cat.id} className="category-card" onClick={() => handleSetActiveCategory(cat)}>
            {cat.name}
          </div>
        ))}
      </div>

      {/* PRODUCT TABLE */}
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
            {allProducts.length > 0 ? (
              allProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.categoryName}</td>
                  <td>{p.name}</td>
                  <td>{p.main_image && <img src={p.main_image} alt="main" className="mini-main" />}</td>
                  <td className="thumbs">{p.thumbnails?.map((t, j) => <img key={j} src={t} alt="thumb" />)}</td>
                  <td>{p.variants?.map((v, i) => <div key={i}>{v.size}/{v.color} - ₹{v.price} ({v.stock})</div>)}</td>
                  <td>
                    <button className="update-btn" onClick={() => updateProduct(p)}>Update</button>
                    <button className="delete-btn" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6}>No products available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {activeCategory && (
        <div className="modal">
          <div className="modal-box">
            <h3>{product.name ? "Update Product" : "Add Product"} in {activeCategory.name}</h3>

            <input
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />

            <h4>Main Image</h4>
            <label className="upload-btn">
              Upload Main Image
              <input type="file" onChange={handleMainImage} hidden />
            </label>
            {product.mainImage && <img src={product.mainImage.url} className="main-image" alt="main" />}

            <h4>Thumbnails</h4>
            <label className="upload-btn secondary">
              Upload Thumbnails
              <input type="file" multiple onChange={handleThumbnails} hidden />
            </label>
            <div className="thumb-preview">
              {product.thumbnails.map((img, i) => <img key={i} src={img.url} alt="thumb" />)}
            </div>

            <h4>Variants</h4>
            {product.variants.map((v, i) => (
              <div key={i} className="variant">
                <select onChange={(e) => updateVariant(i, "size", e.target.value)}>
                  <option value="">Size</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                </select>
                <input placeholder="Color" onChange={(e) => updateVariant(i, "color", e.target.value)} />
                <input type="number" placeholder="Price" onChange={(e) => updateVariant(i, "price", e.target.value)} />
                <input type="number" placeholder="Stock" onChange={(e) => updateVariant(i, "stock", e.target.value)} />
              </div>
            ))}
            <button onClick={addVariant} className="add-variant-btn">+ Add Size / Color</button>
            <button className="save" onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Product"}</button>

            <button className="close" onClick={() => setActiveCategory(null)}>Close</button>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .admin { padding:20px; font-family:Arial,sans-serif; }
        h1 { color:#0b5ed7; text-align:center; }

        .add-category { display:flex; gap:10px; flex-wrap:wrap; }
        .add-category input { flex:1; padding:10px; border-radius:8px; border:1px solid #cbd5e1; }
        .add-category button { background:#0b5ed7; color:white; border:none; border-radius:8px; padding:10px 16px; font-weight:bold; cursor:pointer; }

        .category-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:15px; }
        .category-card { background:#fff; padding:20px; border-radius:14px; text-align:center; cursor:pointer; box-shadow:0 8px 16px rgba(0,0,0,.1); font-weight:bold; transition: transform 0.2s; }
        .category-card:hover { transform:translateY(-3px); }

        /* TABLE SCROLL ONLY */
        .table-wrapper { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .product-table { width:100%; min-width:900px; border-collapse:collapse; }
        .product-table th, .product-table td { border:1px solid #ddd; padding:8px; white-space:nowrap; text-align:left; }
        .product-table th { background-color:#f3f4f6; }
        .mini-main { width:60px; height:60px; object-fit:cover; border-radius:6px; }
        .thumbs img, .thumb-preview img { width:40px; height:40px; object-fit:cover; border-radius:4px; margin-right:4px; }

        .update-btn, .delete-btn, .add-variant-btn, .save, .close { border-radius:6px; padding:6px 10px; font-size:12px; cursor:pointer; border:none; }
        .update-btn, .add-variant-btn, .save { background:#0b5ed7; color:#fff; }
        .delete-btn, .close { background:#ef4444; color:#fff; }

        .modal { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; padding:10px; }
        .modal-box { background:white; width:100%; max-width:550px; max-height:90vh; overflow-y:auto; padding:20px; border-radius:16px; }
        .main-image { width:100%; max-width:200px; max-height:150px; object-fit:contain; display:block; margin:0 auto 10px; border-radius:12px; }

        .variant { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:10px; }
        input, select { padding:8px; border-radius:6px; border:1px solid #cbd5e1; }

        /* MOBILE */
        @media (max-width:768px){
          h1 { font-size:1.2rem; }

          .add-category { flex-direction: column; gap:6px; }
          .add-category input { font-size:14px; padding:6px; }
          .add-category button { width:100%; font-size:14px; padding:8px; }

          .category-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .category-card { padding:14px; font-size:14px; }

          .table-wrapper { overflow-x:auto; -webkit-overflow-scrolling:touch; }
          .product-table th, .product-table td { font-size:10px; padding:4px; }
          .mini-main { width:30px; height:30px; }
          .thumbs img, .thumb-preview img { width:24px; height:24px; }

          .update-btn, .delete-btn, .add-variant-btn, .save, .close { padding:4px 6px; font-size:10px; }

          .modal-box { width:95vw; max-width:400px; max-height:90vh; padding:12px; overflow-y:auto; }
          .modal-box h3 { font-size:1rem; }
          .modal-box h4 { font-size:0.85rem; margin-top:8px; }
          input, select { padding:6px; font-size:12px; }
          .main-image { max-width:120px; max-height:100px; }

          .variant { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
        }
      `}</style>
    </div>
  );
}
